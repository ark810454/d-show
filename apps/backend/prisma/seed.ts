import {
  ActivityStatus,
  ActivityType,
  CashRegisterStatus,
  ClientType,
  CompanyStatus,
  FinancialTransactionType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  ResourceStatus,
  ShopProductStatus,
  ShopSaleStatus,
  StockMovementType,
  UserStatus,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin123!", 10);

  const company = await prisma.company.upsert({
    where: { slug: "d-show-complex" },
    update: {},
    create: {
      nom: "D_Show Complex",
      slug: "d-show-complex",
      raisonSociale: "D_Show SARL",
      telephone: "+243000000000",
      email: "contact@dshow.app",
      adresse: "Kinshasa, Gombe",
      statut: CompanyStatus.ACTIVE,
    },
  });

  const roles = [
    "super_admin",
    "admin_entreprise",
    "manager",
    "serveur",
    "caissier",
    "dj",
    "cordonnier",
    "vendeur",
    "comptable",
  ];

  for (const nom of roles) {
    await prisma.role.upsert({
      where: { nom },
      update: {},
      create: {
        nom,
        description: `Role systeme ${nom}`,
      },
    });
  }

  const adminUser = await prisma.user.upsert({
    where: {
      email: "admin@dshow.app",
    },
    update: {},
    create: {
      companyId: company.id,
      nom: "Admin",
      prenom: "D_Show",
      email: "admin@dshow.app",
      telephone: "+243111111111",
      motDePasseHash: passwordHash,
      statut: UserStatus.ACTIVE,
    },
  });

  const activities = [
    { code: "RESTO", nom: "Restaurant Signature", type: ActivityType.RESTAURANT },
    { code: "TERR", nom: "Terrasse Sunset", type: ActivityType.TERRASSE },
    { code: "CLUB", nom: "Boite de Nuit Pulse", type: ActivityType.BOITE_NUIT },
    { code: "SHOP", nom: "Boutique Prestige", type: ActivityType.SHOP },
    { code: "CORDO", nom: "Cordonnerie Premium", type: ActivityType.CORDONNERIE },
  ];

  const createdActivities = [];
  for (const entry of activities) {
    const activity = await prisma.activity.upsert({
      where: {
        companyId_code: {
          companyId: company.id,
          code: entry.code,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        code: entry.code,
        nom: entry.nom,
        type: entry.type,
        description: `Activite ${entry.nom}`,
        statut: ActivityStatus.ACTIVE,
      },
    });
    createdActivities.push(activity);
  }

  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { nom: "super_admin" },
  });

  await prisma.userRoleActivity.upsert({
    where: {
      userId_roleId_activityId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
        activityId: createdActivities[0].id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
      activityId: createdActivities[0].id,
    },
  });

  const existingClient = await prisma.client.findFirst({
    where: {
      companyId: company.id,
      email: "grace@example.com",
    },
  });

  const client =
    existingClient ??
    (await prisma.client.create({
      data: {
        companyId: company.id,
        nom: "Mukendi",
        prenom: "Grace",
        telephone: "+243222222222",
        email: "grace@example.com",
        typeClient: ClientType.VIP,
        note: "Cliente reguliere du complexe",
      },
    }));

  const restaurantActivity = createdActivities.find((item) => item.type === ActivityType.RESTAURANT)!;
  const shopActivity = createdActivities.find((item) => item.type === ActivityType.SHOP)!;

  const restaurantTable = await prisma.restaurantTable.upsert({
    where: {
      activityId_code: {
        activityId: restaurantActivity.id,
        code: "T-04",
      },
    },
    update: {},
    create: {
      companyId: company.id,
      activityId: restaurantActivity.id,
      code: "T-04",
      nom: "Table 04",
      zone: "Salle principale",
      capacite: 4,
      statut: ResourceStatus.OCCUPEE,
    },
  });

  const restaurantOrder = await prisma.restaurantOrder.upsert({
    where: { reference: "CMD-2401" },
    update: {},
    create: {
      companyId: company.id,
      activityId: restaurantActivity.id,
      clientId: client.id,
      serverId: adminUser.id,
      tableId: restaurantTable.id,
      reference: "CMD-2401",
      statut: OrderStatus.PAYE,
      statutPaiement: PaymentStatus.PAYE,
      modePaiement: PaymentMethod.CASH,
      totalTtc: 82500,
      remise: 0,
    },
  });

  const existingOrderItem = await prisma.restaurantOrderItem.findFirst({
    where: {
      restaurantOrderId: restaurantOrder.id,
      libelle: "Plateau special",
    },
  });

  if (!existingOrderItem) {
    await prisma.restaurantOrderItem.create({
      data: {
        companyId: company.id,
        activityId: restaurantActivity.id,
        restaurantOrderId: restaurantOrder.id,
        libelle: "Plateau special",
        quantite: 2,
        prixUnitaire: 41250,
        totalLigne: 82500,
      },
    });
  }

  const category = await prisma.shopCategory.upsert({
    where: {
      activityId_nom: {
        activityId: shopActivity.id,
        nom: "Chaussures",
      },
    },
    update: {},
    create: {
      companyId: company.id,
      activityId: shopActivity.id,
      nom: "Chaussures",
      actif: true,
    },
  });

  const product = await prisma.shopProduct.upsert({
    where: {
      activityId_sku: {
        activityId: shopActivity.id,
        sku: "SHO-001",
      },
    },
    update: {},
    create: {
      companyId: company.id,
      activityId: shopActivity.id,
      categoryId: category.id,
      sku: "SHO-001",
      nom: "Mocassin cuir",
      prixVente: 95000,
      prixAchat: 60000,
      stockActuel: 8,
      stockMinimum: 2,
      statut: ShopProductStatus.ACTIVE,
    },
  });

  const cashRegister = await prisma.cashRegister.upsert({
    where: {
      activityId_code: {
        activityId: shopActivity.id,
        code: "SHOP-CAISSE-01",
      },
    },
    update: {},
    create: {
      companyId: company.id,
      activityId: shopActivity.id,
      code: "SHOP-CAISSE-01",
      nom: "Caisse Boutique 01",
      statut: CashRegisterStatus.OUVERTE,
      soldeOuverture: 500000,
      soldeCourant: 595000,
    },
  });

  const shopSale = await prisma.shopSale.upsert({
    where: { reference: "SHP-4421" },
    update: {},
    create: {
      companyId: company.id,
      activityId: shopActivity.id,
      clientId: client.id,
      sellerId: adminUser.id,
      reference: "SHP-4421",
      statut: ShopSaleStatus.PAYEE,
      statutPaiement: PaymentStatus.PAYE,
      modePaiement: PaymentMethod.CASH,
      totalTtc: 95000,
      remise: 0,
    },
  });

  const existingSaleItem = await prisma.shopSaleItem.findFirst({
    where: {
      shopSaleId: shopSale.id,
      productId: product.id,
    },
  });

  if (!existingSaleItem) {
    await prisma.shopSaleItem.create({
      data: {
        companyId: company.id,
        activityId: shopActivity.id,
        shopSaleId: shopSale.id,
        productId: product.id,
        libelle: product.nom,
        quantite: 1,
        prixUnitaire: 95000,
        totalLigne: 95000,
      },
    });
  }

  const existingStockMovement = await prisma.stockMovement.findFirst({
    where: {
      reference: "STK-INIT-001",
    },
  });

  if (!existingStockMovement) {
    await prisma.stockMovement.create({
      data: {
        companyId: company.id,
        activityId: shopActivity.id,
        productId: product.id,
        userId: adminUser.id,
        typeMouvement: StockMovementType.ENTREE,
        quantite: 8,
        coutUnitaire: 60000,
        reference: "STK-INIT-001",
        raison: "Stock initial",
      },
    });
  }

  const financeAccount = await prisma.financeAccount.create({
    data: {
      companyId: company.id,
      code: "701000",
      nom: "Ventes marchandises",
      actif: true,
    },
  });

  await prisma.financialTransaction.createMany({
    data: [
      {
        companyId: company.id,
        activityId: restaurantActivity.id,
        userId: adminUser.id,
        clientId: client.id,
        restaurantOrderId: restaurantOrder.id,
        reference: "FIN-CMD-2401",
        typeTransaction: FinancialTransactionType.VENTE,
        modePaiement: PaymentMethod.CASH,
        statutPaiement: PaymentStatus.PAYE,
        montant: 82500,
        description: "Encaissement restaurant",
      },
      {
        companyId: company.id,
        activityId: shopActivity.id,
        financeAccountId: financeAccount.id,
        cashRegisterId: cashRegister.id,
        userId: adminUser.id,
        clientId: client.id,
        shopSaleId: shopSale.id,
        reference: "FIN-SHP-4421",
        typeTransaction: FinancialTransactionType.VENTE,
        modePaiement: PaymentMethod.CASH,
        statutPaiement: PaymentStatus.PAYE,
        montant: 95000,
        description: "Encaissement boutique",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.userActivityLog.create({
    data: {
      userId: adminUser.id,
      companyId: company.id,
      activityId: restaurantActivity.id,
      action: "CREATE",
      module: "SEED",
      description: "Initialisation des donnees de demonstration",
      ipAddress: "127.0.0.1",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
