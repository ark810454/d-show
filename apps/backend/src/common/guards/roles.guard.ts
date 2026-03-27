import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../config/prisma.service";
import { ROLES_KEY } from "../constants/roles.constant";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const activityId = request.headers["x-activity-id"] as string | undefined;
    const resolvedUser = user?.id
      ? await this.prisma.user.findUnique({
          where: { id: user.id },
          select: {
            assignments: {
              select: {
                activityId: true,
                role: {
                  select: {
                    nom: true,
                  },
                },
              },
            },
          },
        })
      : null;
    const assignments = resolvedUser?.assignments ?? user?.assignments ?? [];
    const isCompanyAdmin = Boolean(
      assignments.some(
        (assignment: { role?: { nom?: string } }) =>
          ["super_admin", "admin_entreprise"].includes(assignment.role?.nom ?? ""),
      ),
    );

    if (isCompanyAdmin) {
      return true;
    }

    const roleNames: string[] =
      assignments
        ?.filter((assignment: { activityId?: string; role?: { nom?: string } }) =>
          activityId ? assignment.activityId === activityId : true,
        )
        .map((assignment: { role?: { nom?: string } }) => assignment.role?.nom ?? "")
        .filter(Boolean) ?? [];

    const hasRole = requiredRoles.some((role) => roleNames.includes(role));
    if (!hasRole) {
      throw new ForbiddenException("Acces refuse pour ce role");
    }

    return true;
  }
}
