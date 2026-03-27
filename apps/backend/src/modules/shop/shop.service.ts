import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { CreateShopCategoryDto } from "./dto/create-shop-category.dto";
import { CreateShopProductDto } from "./dto/create-shop-product.dto";
import { CreateShopPromotionDto } from "./dto/create-shop-promotion.dto";
import { CreateShopSaleDto } from "./dto/create-shop-sale.dto";
import { UpdateShopProductDto } from "./dto/update-shop-product.dto";

const ACTIVITY_TYPE = {
  SHOP: "SHOP",
} as const;

const FINANCIAL_TRANSACTION_TYPE = {
  VENTE: "VENTE",
} as const;

const PAYMENT_STATUS = {
  PAYE: "PAYE",
} as const;

const SHOP_PRODUCT_STATUS = {
  ACTIVE: "ACTIVE",
} as const;

const SHOP_SALE_STATUS = {
  PAYEE: "PAYEE",
} as const;

const STOCK_MOVEMENT_TYPE = {
  SORTIE: "SORTIE",
} as const;

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async createCategory(dto: CreateShopCategoryDto) {
    await this.ensureShopActivity(dto.companyId, dto.activityId);
    try {
      return await this.prisma.shopCategory.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          nom: dto.nom,
          description: dto.description,
        },
      });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002") {
        throw new BadRequestException("Une categorie portant ce nom existe deja dans cette boutique.");
      }
      throw error;
    }
  }

  categories(companyId: string, activityId: string) {
    return this.prisma.shopCategory.findMany({
      where: { companyId, activityId, deletedAt: null },
      orderBy: { nom: "asc" },
    });
  }

  async createProduct(dto: CreateShopProductDto) {
    await this.ensureShopActivity(dto.companyId, dto.activityId);
    try {
      const sku = dto.sku?.trim()
        ? dto.sku.trim().toUpperCase()
        : await this.generateSku(dto.companyId, dto.activityId, dto.nom);
      return await this.prisma.shopProduct.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          categoryId: dto.categoryId,
          sku,
          codeBarres: dto.codeBarres,
          nom: dto.nom,
          description: dto.description,
          image: dto.image,
          prixVente: dto.prixVente,
          prixAchat: dto.prixAchat,
          stockActuel: dto.stockActuel,
          stockMinimum: dto.stockMinimum,
          statut: dto.statut ?? SHOP_PRODUCT_STATUS.ACTIVE,
        },
        include: { categorie: true, promotions: true },
      });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002") {
        throw new BadRequestException(
          "Le SKU ou le code-barres existe deja pour cette boutique. Utilisez une reference unique.",
        );
      }
      throw error;
    }
  }

  products(companyId: string, activityId: string, q?: string) {
    return this.prisma.shopProduct.findMany({
      where: {
        companyId,
        activityId,
        deletedAt: null,
        ...(q
          ? {
              OR: [
                { nom: { contains: q } },
                { sku: { contains: q } },
                { codeBarres: { contains: q } },
              ],
            }
          : {}),
      },
      include: {
        categorie: true,
        promotions: {
          where: { actif: true },
          orderBy: { dateDebut: "desc" },
        },
      },
      orderBy: [{ nom: "asc" }],
    });
  }

  async updateProduct(id: string, companyId: string, activityId: string, dto: UpdateShopProductDto) {
    const product = await this.prisma.shopProduct.findFirst({
      where: { id, companyId, activityId, deletedAt: null },
    });
    if (!product) throw new NotFoundException("Produit introuvable");
    return this.prisma.shopProduct.update({
      where: { id },
      data: dto,
      include: { categorie: true, promotions: true },
    });
  }

  async createPromotion(dto: CreateShopPromotionDto) {
    await this.ensureShopActivity(dto.companyId, dto.activityId);
    if (new Date(dto.dateFin) < new Date(dto.dateDebut)) {
      throw new BadRequestException("La date de fin doit etre posterieure a la date de debut.");
    }
    return this.prisma.shopPromotion.create({
      data: {
        companyId: dto.companyId,
        activityId: dto.activityId,
        productId: dto.productId,
        nom: dto.nom,
        description: dto.description,
        reductionType: dto.reductionType,
        reductionValeur: dto.reductionValeur,
        dateDebut: new Date(dto.dateDebut),
        dateFin: new Date(dto.dateFin),
        actif: dto.actif ?? true,
      },
      include: { product: true },
    });
  }

  promotions(companyId: string, activityId: string) {
    return this.prisma.shopPromotion.findMany({
      where: { companyId, activityId },
      include: { product: true },
      orderBy: { dateDebut: "desc" },
    });
  }

  async createSale(dto: CreateShopSaleDto) {
    await this.ensureShopActivity(dto.companyId, dto.activityId);
    const products = await this.prisma.shopProduct.findMany({
      where: { id: { in: dto.items.map((item) => item.productId).filter(Boolean) as string[] } },
      include: { promotions: { where: { actif: true } } },
    });

    const now = new Date();
    const lines = dto.items.map((item) => {
      const product = products.find((entry: { id?: string }) => entry.id === item.productId);
      const promo = product?.promotions.find((entry: { dateDebut: Date; dateFin: Date }) => entry.dateDebut <= now && entry.dateFin >= now);
      let prixUnitaire = item.prixUnitaire;
      if (promo) {
        prixUnitaire =
          promo.reductionType === "PERCENT"
            ? Math.max(0, item.prixUnitaire - item.prixUnitaire * (Number(promo.reductionValeur) / 100))
            : Math.max(0, item.prixUnitaire - Number(promo.reductionValeur));
      }
      return {
        ...item,
        prixUnitaire,
        totalLigne: prixUnitaire * item.quantite,
      };
    });

    for (const line of lines) {
      if (!line.productId) continue;
      const product = products.find((entry: { id?: string }) => entry.id === line.productId);
      if (!product) throw new NotFoundException("Produit du panier introuvable");
      if (product.stockActuel < line.quantite) {
        throw new BadRequestException(`Stock insuffisant pour ${product.nom}`);
      }
    }

    const totalHt = lines.reduce((sum, item) => sum + item.totalLigne, 0);
    const totalTtc = Math.max(0, totalHt - dto.remise + dto.taxeMontant);

    const sale = await this.prisma.$transaction(async (tx: any) => {
      const created = await tx.shopSale.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          clientId: dto.clientId,
          sellerId: dto.sellerId,
          reference: `SHOP-${Date.now()}`,
          statut: SHOP_SALE_STATUS.PAYEE,
          statutPaiement: PAYMENT_STATUS.PAYE,
          modePaiement: dto.modePaiement,
          totalHt,
          taxeMontant: dto.taxeMontant,
          totalTtc,
          remise: dto.remise,
          note: dto.note,
          items: {
            create: lines.map((item) => ({
              companyId: dto.companyId,
              activityId: dto.activityId,
              productId: item.productId,
              libelle: item.libelle,
              quantite: item.quantite,
              prixUnitaire: item.prixUnitaire,
              totalLigne: item.totalLigne,
            })),
          },
        },
        include: { items: true, client: true, vendeur: true },
      });

      for (const line of lines) {
        if (!line.productId) continue;
        const product = products.find((entry: { id?: string }) => entry.id === line.productId)!;
        await tx.shopProduct.update({
          where: { id: product.id },
          data: { stockActuel: { decrement: line.quantite } },
        });
        await tx.stockMovement.create({
          data: {
            companyId: dto.companyId,
            activityId: dto.activityId,
            productId: product.id,
            userId: dto.sellerId,
            typeMouvement: STOCK_MOVEMENT_TYPE.SORTIE,
            quantite: line.quantite,
            coutUnitaire: product.prixAchat,
            reference: created.reference,
            raison: "Vente boutique",
          },
        });
      }

      await tx.financialTransaction.create({
        data: {
          companyId: dto.companyId,
          activityId: dto.activityId,
          userId: dto.sellerId,
          clientId: dto.clientId,
          shopSaleId: created.id,
          reference: `FIN-${created.reference}`,
          typeTransaction: FINANCIAL_TRANSACTION_TYPE.VENTE,
          modePaiement: dto.modePaiement,
          statutPaiement: PAYMENT_STATUS.PAYE,
          montant: totalTtc,
          description: "Encaissement boutique",
        },
      });

      return created;
    });

    this.realtimeGateway.broadcastShopSaleCreated(sale);
    this.realtimeGateway.broadcastShopStockUpdated({ companyId: dto.companyId, activityId: dto.activityId });
    return sale;
  }

  sales(companyId: string, activityId: string) {
    return this.prisma.shopSale.findMany({
      where: { companyId, activityId, deletedAt: null },
      include: { items: true, client: true, vendeur: true },
      orderBy: { createdAt: "desc" },
    });
  }

  lowStock(companyId: string, activityId: string) {
    return this.prisma.shopProduct.findMany({
      where: {
        companyId,
        activityId,
        deletedAt: null,
        statut: SHOP_PRODUCT_STATUS.ACTIVE,
      },
      include: { categorie: true },
      orderBy: { stockActuel: "asc" },
    }).then((items: Array<{ stockActuel: number; stockMinimum: number }>) =>
      items.filter((item: { stockActuel: number; stockMinimum: number }) => item.stockActuel <= item.stockMinimum),
    );
  }

  stockMovements(companyId: string, activityId: string) {
    return this.prisma.stockMovement.findMany({
      where: { companyId, activityId },
      include: { product: true, user: true },
      orderBy: { occuredAt: "desc" },
    });
  }

  async stats(companyId: string, activityId: string) {
    const [sales, products, movements] = await Promise.all([
      this.prisma.shopSale.findMany({
        where: { companyId, activityId, deletedAt: null },
        include: { items: true },
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.shopProduct.findMany({
        where: { companyId, activityId, deletedAt: null },
      }),
      this.prisma.stockMovement.findMany({
        where: { companyId, activityId },
        include: { product: true },
        orderBy: { occuredAt: "asc" },
      }),
    ]);

    const productSales = new Map<string, number>();
    const dailySales = new Map<string, number>();
    let estimatedMargin = 0;

    for (const sale of sales) {
      const day = sale.createdAt.toISOString().slice(0, 10);
      dailySales.set(day, (dailySales.get(day) ?? 0) + Number(sale.totalTtc));
      for (const item of sale.items) {
        productSales.set(item.libelle, (productSales.get(item.libelle) ?? 0) + item.quantite);
        const product = products.find((entry: { id?: string }) => entry.id === item.productId);
        const purchase = Number(product?.prixAchat ?? 0);
        estimatedMargin += Number(item.totalLigne) - purchase * item.quantite;
      }
    }

    return {
      revenue: sales.reduce((sum: number, sale: { totalTtc: unknown }) => sum + Number(sale.totalTtc), 0),
      salesCount: sales.length,
      estimatedMargin,
      bestProducts: Array.from(productSales.entries())
        .map(([label, qty]) => ({ label, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 10),
      dailySales: Array.from(dailySales.entries()).map(([date, amount]) => ({ date, amount })),
      stockEvolution: movements.slice(-20).map((movement: { product: { nom: string }; quantite: number; typeMouvement: string; occuredAt: Date }) => ({
        label: movement.product.nom,
        quantity: movement.quantite,
        type: movement.typeMouvement,
        occuredAt: movement.occuredAt,
      })),
    };
  }

  private async ensureShopActivity(companyId: string, activityId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, companyId, type: ACTIVITY_TYPE.SHOP, deletedAt: null },
    });
    if (!activity) throw new BadRequestException("Cette activité n'est pas une boutique valide");
    return activity;
  }

  private async generateSku(companyId: string, activityId: string, nom: string) {
    const normalized = nom
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9 ]/g, " ")
      .trim()
      .toUpperCase();
    const compact = normalized.replace(/\s+/g, "");
    const prefix = (compact.slice(0, 3) || "PRD").padEnd(3, "X");

    const existing = await this.prisma.shopProduct.findMany({
      where: {
        companyId,
        activityId,
        sku: { startsWith: prefix },
      },
      select: { sku: true },
      orderBy: { sku: "desc" },
      take: 100,
    });

    let next = 1;
    for (const product of existing) {
      const match = product.sku.match(new RegExp(`^${prefix}(\\d+)$`));
      if (!match) continue;
      next = Math.max(next, Number(match[1]) + 1);
    }

    return `${prefix}${String(next).padStart(3, "0")}`;
  }
}
