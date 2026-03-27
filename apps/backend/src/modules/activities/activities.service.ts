import { ActivityStatus } from "@prisma/client";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateActivityDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });

    if (!company) {
      throw new BadRequestException("Entreprise introuvable");
    }

    return this.prisma.activity.create({
      data: {
        companyId: dto.companyId,
        nom: dto.nom,
        code: dto.code ?? this.buildCode(dto.nom),
        type: dto.type as never,
        description: dto.description,
        statut: dto.statut ?? ActivityStatus.ACTIVE,
      },
    });
  }

  findByCompany(
    companyId: string,
    actor?: {
      id?: string;
      companyId?: string | null;
      assignments?: Array<{ activityId?: string; role?: { nom?: string } }>;
    },
  ) {
    const hasCompanyWideAccess = Boolean(
      actor?.assignments?.some((assignment) =>
        ["super_admin", "admin_entreprise"].includes(assignment.role?.nom ?? ""),
      ),
    );

    return this.prisma.activity.findMany({
      where: {
        companyId,
        deletedAt: null,
        ...(!hasCompanyWideAccess && actor?.id
          ? {
              assignments: {
                some: {
                  userId: actor.id,
                },
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        company: true,
      },
    });

    if (!activity) {
      throw new NotFoundException("Activite introuvable");
    }

    return activity;
  }

  async update(id: string, dto: UpdateActivityDto) {
    await this.findOne(id);

    return this.prisma.activity.update({
      where: { id },
      data: {
        nom: dto.nom,
        code: dto.code,
        type: dto.type as never,
        description: dto.description,
        statut: dto.statut,
      },
    });
  }

  async updateStatus(id: string, statut: ActivityStatus) {
    await this.findOne(id);

    return this.prisma.activity.update({
      where: { id },
      data: { statut },
    });
  }

  private buildCode(value: string) {
    return value
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9]+/g, "")
      .slice(0, 10);
  }
}
