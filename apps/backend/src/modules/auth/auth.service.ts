import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../config/prisma.service";
import type { JwtPayload } from "../../common/interfaces/jwt-payload.interface";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async login(dto: LoginDto, ipAddress?: string) {
    const candidates = await this.usersService.findActiveByEmailCandidates(dto.email);
    if (!candidates.length) {
      throw new UnauthorizedException("Identifiants invalides");
    }

    let user = null;
    for (const candidate of candidates) {
      const isPasswordValid = await bcrypt.compare(dto.password, candidate.motDePasseHash);
      if (isPasswordValid) {
        user = candidate;
        break;
      }
    }

    if (!user) {
      throw new UnauthorizedException("Identifiants invalides");
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
    });
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);

    await this.usersService.updateRefreshToken(user.id, refreshTokenHash);
    await this.prisma.userActivityLog.create({
      data: {
        userId: user.id,
        companyId: user.companyId,
        action: "LOGIN",
        module: "AUTH",
        description: "Connexion utilisateur reussie",
        ipAddress,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        companyId: user.companyId,
        company: user.company,
        assignments: user.assignments,
      },
      ...tokens,
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET", "change-me-refresh"),
    });

    const resolvedUserId = userId || payload.sub;
    const user = await this.usersService.findById(resolvedUserId);
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException("Refresh token invalide");
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      throw new UnauthorizedException("Refresh token invalide");
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
    });
    await this.usersService.updateRefreshToken(user.id, await bcrypt.hash(tokens.refreshToken, 10));

    return tokens;
  }

  async logout(userId: string) {
    const user = await this.usersService.findById(userId);
    await this.usersService.updateRefreshToken(userId, null);
    if (user) {
      await this.prisma.userActivityLog.create({
        data: {
          userId: user.id,
          companyId: user.companyId,
          action: "LOGOUT",
          module: "AUTH",
          description: "Deconnexion utilisateur",
        },
      });
    }
    return { success: true };
  }

  private async generateTokens(payload: JwtPayload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>("JWT_ACCESS_SECRET", "change-me-access"),
      expiresIn: this.configService.get<string>("JWT_ACCESS_TTL", "15m"),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET", "change-me-refresh"),
      expiresIn: this.configService.get<string>("JWT_REFRESH_TTL", "7d"),
    });

    return { accessToken, refreshToken };
  }
}
