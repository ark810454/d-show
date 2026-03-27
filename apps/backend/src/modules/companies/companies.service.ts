import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CompanyStatus } from "@prisma/client";
import { PrismaService } from "../../config/prisma.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    const slug = this.slugify(dto.nom);

    const existing = await this.prisma.company.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new BadRequestException("Une entreprise avec ce nom existe deja");
    }

    return this.prisma.company.create({
      data: {
        nom: dto.nom,
        slug,
        raisonSociale: dto.raisonSociale,
        rccm: dto.rccm,
        idNat: dto.idNat,
        numeroImpot: dto.numeroImpot,
        telephone: dto.telephone,
        email: dto.email,
        adresse: dto.adresse,
        logo: dto.logo,
        statut: dto.statut ?? CompanyStatus.ACTIVE,
      },
    });
  }

  findAuthorizedForUser(user: {
    companyId?: string | null;
    assignments?: Array<{ role?: { nom?: string } }>;
  }) {
    const hasGlobalAccess = Boolean(
      user?.assignments?.some((assignment: { role?: { nom?: string } }) => assignment.role?.nom === "super_admin"),
    );

    return this.prisma.company.findMany({
      where: {
        ...(hasGlobalAccess ? {} : { id: user.companyId ?? "" }),
        deletedAt: null,
      },
      include: {
        activities: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findAll() {
    return this.prisma.company.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        activities: {
          where: { deletedAt: null },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        activities: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!company) {
      throw new NotFoundException("Entreprise introuvable");
    }

    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findOne(id);

    return this.prisma.company.update({
      where: { id },
      data: {
        nom: dto.nom,
        raisonSociale: dto.raisonSociale,
        rccm: dto.rccm,
        idNat: dto.idNat,
        numeroImpot: dto.numeroImpot,
        telephone: dto.telephone,
        email: dto.email,
        adresse: dto.adresse,
        logo: dto.logo,
        statut: dto.statut,
        ...(dto.nom ? { slug: this.slugify(dto.nom) } : {}),
      },
    });
  }

  async updateStatus(id: string, statut: CompanyStatus) {
    await this.findOne(id);

    return this.prisma.company.update({
      where: { id },
      data: { statut },
    });
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
}
