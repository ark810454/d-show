import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resolvedUser = user?.id
      ? await this.prisma.user.findUnique({
          where: { id: user.id },
          select: {
            companyId: true,
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
    const companyId = (request.headers["x-company-id"] as string | undefined) ?? request.params.companyId;
    const activityId = (request.headers["x-activity-id"] as string | undefined) ?? request.params.activityId;
    const userCompanyId = resolvedUser?.companyId ?? user?.companyId;

    if (!isCompanyAdmin && companyId && userCompanyId && companyId !== userCompanyId) {
      throw new ForbiddenException("Entreprise non autorisee");
    }

    if (!isCompanyAdmin && activityId) {
      const allowed = assignments.some(
        (assignment: { activityId?: string }) => assignment.activityId === activityId,
      );

      if (!allowed) {
        throw new ForbiddenException("Activite non autorisee");
      }
    }

    return true;
  }
}
