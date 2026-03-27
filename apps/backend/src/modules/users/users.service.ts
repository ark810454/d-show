import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PaymentStatus, Prisma, UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../config/prisma.service";
import { AssignRoleActivityItemDto } from "./dto/assign-roles.dto";
import { ClockingDto } from "./dto/clocking.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  private readonly superUserOnlyRoles = new Set(["super_admin", "admin_entreprise"]);

  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        statut: UserStatus.ACTIVE,
      },
      include: this.userInclude,
    });
  }

  findActiveByEmailCandidates(email: string) {
    return this.prisma.user.findMany({
      where: {
        email,
        deletedAt: null,
        statut: UserStatus.ACTIVE,
      },
      include: this.userInclude,
      orderBy: [{ createdAt: "desc" }],
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: this.userInclude,
    });
  }

  async findAll(companyId: string, activityId?: string) {
    if (!companyId) {
      throw new BadRequestException("Contexte entreprise requis");
    }

    return this.prisma.user.findMany({
      where: {
        companyId,
        deletedAt: null,
        ...(activityId
          ? {
              assignments: {
                some: {
                  activityId,
                },
              },
            }
          : {}),
      },
      include: this.userInclude,
      orderBy: [{ createdAt: "desc" }],
    });
  }

  async findOne(id: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: this.userInclude,
    });

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    return user;
  }

  async findProfile(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException("Profil introuvable");
    }

    return user;
  }

  async create(dto: CreateUserDto, actor: any, ipAddress?: string) {
    this.ensureSameCompany(dto.companyId, actor);
    this.ensureAssignmentsPresent(dto.assignments);
    await this.ensureEmailAvailable(dto.email);
    await this.validateAssignments(dto.companyId, dto.assignments, actor);

    const passwordHash = await bcrypt.hash(dto.motDePasse, 10);

    const created = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          companyId: dto.companyId,
          nom: dto.nom,
          prenom: dto.prenom,
          email: dto.email,
          telephone: dto.telephone,
          motDePasseHash: passwordHash,
          photo: dto.photo,
          statut: dto.statut ?? UserStatus.ACTIVE,
        },
        include: this.userInclude,
      });

      if (dto.assignments.length) {
        await tx.userRoleActivity.createMany({
          data: dto.assignments.map((assignment) => ({
            userId: user.id,
            activityId: assignment.activityId,
            roleId: assignment.roleId,
          })),
        });
      }

      await tx.userActivityLog.create({
        data: {
          userId: actor.id,
          companyId: actor.companyId,
          action: "CREATE_USER",
          module: "USERS",
          description: `Creation de l'utilisateur ${dto.prenom} ${dto.nom}`,
          ipAddress,
        },
      });

      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        include: this.userInclude,
      });
    });

    return created;
  }

  async update(id: string, companyId: string, dto: UpdateUserDto, actor: any, ipAddress?: string) {
    const targetCompanyId = this.resolveActorCompanyContext(companyId, actor);
    const existing = await this.findOne(id, targetCompanyId);
    if (dto.email && dto.email !== existing.email) {
      await this.ensureEmailAvailable(dto.email, existing.id);
    }

    const data: Prisma.UserUpdateInput = {
      nom: dto.nom,
      prenom: dto.prenom,
      email: dto.email,
      telephone: dto.telephone,
      photo: dto.photo,
      statut: dto.statut,
    };

    if (dto.motDePasse) {
      data.motDePasseHash = await bcrypt.hash(dto.motDePasse, 10);
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: existing.id },
        data,
        include: this.userInclude,
      });

      await tx.userActivityLog.create({
        data: {
          userId: actor.id,
          companyId: targetCompanyId,
          action: "UPDATE_USER",
          module: "USERS",
          description: `Mise a jour de l'utilisateur ${user.prenom} ${user.nom}`,
          ipAddress,
        },
      });

      return user;
    });
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }
    if (dto.email && dto.email !== user.email) {
      await this.ensureEmailAvailable(dto.email, user.id);
    }

    const data: Prisma.UserUpdateInput = {
      nom: dto.nom,
      prenom: dto.prenom,
      email: dto.email,
      telephone: dto.telephone,
      photo: dto.photo,
    };

    if (dto.motDePasse) {
      data.motDePasseHash = await bcrypt.hash(dto.motDePasse, 10);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      include: this.userInclude,
    });
  }

  async deactivate(id: string, companyId: string, actor: any, ipAddress?: string) {
    const targetCompanyId = this.resolveActorCompanyContext(companyId, actor);
    const user = await this.findOne(id, targetCompanyId);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          statut: UserStatus.INACTIVE,
        },
        include: this.userInclude,
      });

      await tx.userActivityLog.create({
        data: {
          userId: actor.id,
          companyId: targetCompanyId,
          action: "DEACTIVATE_USER",
          module: "USERS",
          description: `Desactivation de l'utilisateur ${updated.prenom} ${updated.nom}`,
          ipAddress,
        },
      });

      return updated;
    });
  }

  async remove(id: string, companyId: string, actor: any, ipAddress?: string) {
    const targetCompanyId = this.resolveActorCompanyContext(companyId, actor);
    const user = await this.findOne(id, targetCompanyId);

    if (user.id === actor.id) {
      throw new BadRequestException("Vous ne pouvez pas supprimer votre propre compte");
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.userRoleActivity.deleteMany({
        where: { userId: user.id },
      });

      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          statut: UserStatus.INACTIVE,
          deletedAt: new Date(),
          refreshTokenHash: null,
        },
        include: this.userInclude,
      });

      await tx.userActivityLog.create({
        data: {
          userId: actor.id,
          companyId: targetCompanyId,
          action: "REMOVE_USER",
          module: "USERS",
          description: `Suppression logique de l'utilisateur ${updated.prenom} ${updated.nom}`,
          ipAddress,
        },
      });

      return updated;
    });
  }

  async assignRoles(
    userId: string,
    companyId: string,
    assignments: AssignRoleActivityItemDto[],
    actor: any,
    ipAddress?: string,
  ) {
    const targetCompanyId = this.resolveActorCompanyContext(companyId, actor);
    const user = await this.findOne(userId, targetCompanyId);
    await this.validateAssignments(user.companyId, assignments, actor);

    return this.prisma.$transaction(async (tx) => {
      await tx.userRoleActivity.deleteMany({
        where: { userId: user.id },
      });

      if (assignments.length) {
        await tx.userRoleActivity.createMany({
          data: assignments.map((assignment) => ({
            userId: user.id,
            roleId: assignment.roleId,
            activityId: assignment.activityId,
          })),
        });
      }

      await tx.userActivityLog.create({
        data: {
          userId: actor.id,
          companyId: targetCompanyId,
          action: "ASSIGN_ROLES",
          module: "USERS",
          description: `Attribution des roles pour ${user.prenom} ${user.nom}`,
          ipAddress,
        },
      });

      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        include: this.userInclude,
      });
    });
  }

  async clockIn(userId: string, ipAddress: string | undefined, dto: ClockingDto) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    return this.prisma.userActivityLog.create({
      data: {
        userId,
        companyId: user.companyId,
        activityId: dto.activityId,
        action: "CLOCK_IN",
        module: "TIME_TRACKING",
        description: dto.note ?? "Debut de service",
        ipAddress,
      },
    });
  }

  async clockOut(userId: string, ipAddress: string | undefined, dto: ClockingDto) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    return this.prisma.userActivityLog.create({
      data: {
        userId,
        companyId: user.companyId,
        activityId: dto.activityId,
        action: "CLOCK_OUT",
        module: "TIME_TRACKING",
        description: dto.note ?? "Fin de service",
        ipAddress,
      },
    });
  }

  async getPerformance(userId: string, companyId: string, activityId?: string) {
    const user = await this.findOne(userId, companyId);

    const [timeLogs, restaurantOrders, shopSales, financialTransactions] = await Promise.all([
      this.prisma.userActivityLog.findMany({
        where: {
          userId,
          companyId,
          module: "TIME_TRACKING",
          ...(activityId ? { activityId } : {}),
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.restaurantOrder.findMany({
        where: {
          companyId,
          serverId: userId,
          ...(activityId ? { activityId } : {}),
        },
      }),
      this.prisma.shopSale.findMany({
        where: {
          companyId,
          sellerId: userId,
          ...(activityId ? { activityId } : {}),
        },
      }),
      this.prisma.financialTransaction.findMany({
        where: {
          companyId,
          userId,
          ...(activityId ? { activityId } : {}),
        },
      }),
    ]);

    const clockInCount = timeLogs.filter((item) => item.action === "CLOCK_IN").length;
    const clockOutCount = timeLogs.filter((item) => item.action === "CLOCK_OUT").length;
    const restaurantRevenue = restaurantOrders.reduce((sum, item) => sum + Number(item.totalTtc), 0);
    const shopRevenue = shopSales.reduce((sum, item) => sum + Number(item.totalTtc), 0);
    const collectedRevenue = financialTransactions
      .filter((item) => item.statutPaiement === PaymentStatus.PAYE)
      .reduce((sum, item) => sum + Number(item.montant), 0);

    return {
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
      },
      metrics: {
        pointages: {
          entrees: clockInCount,
          sorties: clockOutCount,
        },
        performance: {
          restaurantOrders: restaurantOrders.length,
          shopSales: shopSales.length,
          restaurantRevenue,
          shopRevenue,
          collectedRevenue,
        },
      },
      recentLogs: timeLogs.slice(0, 10),
    };
  }

  updateRefreshToken(userId: string, refreshTokenHash: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  private ensureSameCompany(targetCompanyId: string, actor: { companyId?: string; assignments?: Array<{ role?: { nom?: string } }> }) {
    const isSuperAdmin = Boolean(
      actor?.assignments?.some((assignment) => assignment.role?.nom === "super_admin"),
    );

    if (!isSuperAdmin && targetCompanyId !== actor.companyId) {
      throw new ForbiddenException("Vous ne pouvez agir que dans votre entreprise");
    }
  }

  private resolveActorCompanyContext(
    companyId: string,
    actor: { companyId?: string; assignments?: Array<{ role?: { nom?: string } }> },
  ): string {
    const isSuperAdmin = Boolean(
      actor?.assignments?.some((assignment) => assignment.role?.nom === "super_admin"),
    );

    const resolvedCompanyId = isSuperAdmin ? companyId : actor.companyId;

    if (!resolvedCompanyId) {
      throw new ForbiddenException("Contexte entreprise introuvable pour cette action");
    }

    return resolvedCompanyId;
  }

  private async ensureEmailAvailable(email: string, excludedUserId?: string) {
    const existing = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        ...(excludedUserId ? { id: { not: excludedUserId } } : {}),
      },
      select: {
        id: true,
        company: {
          select: {
            nom: true,
          },
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Cet email est deja utilise dans l'entreprise ${existing.company.nom}. Utilisez une adresse email unique.`,
      );
    }
  }

  private async validateAssignments(
    companyId: string,
    assignments: Array<{ activityId: string; roleId: string }>,
    actor: { id?: string; assignments?: Array<{ activityId?: string; role?: { nom?: string } }> },
  ) {
    if (!assignments.length) {
      return;
    }

    const activities = await this.prisma.activity.findMany({
      where: {
        companyId,
        id: { in: assignments.map((assignment) => assignment.activityId) },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (activities.length !== new Set(assignments.map((assignment) => assignment.activityId)).size) {
      throw new BadRequestException("Une ou plusieurs activites d'affectation sont invalides");
    }

    const roleIds = [...new Set(assignments.map((assignment) => assignment.roleId))];
    const roles = await this.prisma.role.findMany({
      where: {
        id: { in: roleIds },
      },
      select: {
        id: true,
        nom: true,
      },
    });

    if (roles.length !== roleIds.length) {
      throw new BadRequestException("Un ou plusieurs roles d'affectation sont invalides");
    }

    const isSuperAdmin = Boolean(
      actor?.assignments?.some((assignment) => assignment.role?.nom === "super_admin"),
    );
    const isGlobalAdmin = Boolean(
      actor?.assignments?.some((assignment) =>
        ["super_admin", "admin_entreprise"].includes(assignment.role?.nom ?? ""),
      ),
    );

    const protectedRole = roles.find((role) => this.superUserOnlyRoles.has(role.nom));
    if (protectedRole && !isSuperAdmin) {
      throw new ForbiddenException(
        "Les roles admin_entreprise et super_admin sont reserves au super utilisateur admin@dshow.app.",
      );
    }

    if (isGlobalAdmin) {
      return;
    }

    const allowedActivityIds = new Set(
      actor?.assignments?.map((assignment) => assignment.activityId).filter(Boolean) ?? [],
    );

    const forbiddenAssignment = assignments.find((assignment) => !allowedActivityIds.has(assignment.activityId));
    if (forbiddenAssignment) {
      throw new ForbiddenException("Vous ne pouvez attribuer des roles que sur vos activites autorisees");
    }
  }

  private ensureAssignmentsPresent(assignments: Array<{ activityId: string; roleId: string }>) {
    if (!assignments.length) {
      throw new BadRequestException(
        "Attribuez au moins un role sur une activite avant de creer cet utilisateur.",
      );
    }
  }

  private readonly userInclude = {
    company: true,
    assignments: {
      include: {
        role: true,
        activity: true,
      },
    },
  } as const;
}
