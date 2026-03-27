import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { ActivityContext } from "../../common/decorators/activity-context.decorator";
import { CompanyContext } from "../../common/decorators/company-context.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ScopeGuard } from "../../common/guards/scope.guard";
import { AssignRolesDto } from "./dto/assign-roles.dto";
import { ClockingDto } from "./dto/clocking.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard, ScopeGuard, RolesGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles("super_admin", "admin_entreprise", "manager")
  @Get()
  findAll(@CompanyContext() companyId: string, @ActivityContext() activityId?: string) {
    return this.usersService.findAll(companyId, activityId);
  }

  @Get("me/profile")
  getProfile(@CurrentUser() user: any) {
    return this.usersService.findProfile(user.id);
  }

  @Patch("me/profile")
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post("me/clock-in")
  clockIn(@CurrentUser() user: any, @Req() request: Request, @Body() dto: ClockingDto) {
    return this.usersService.clockIn(user.id, request.ip, dto);
  }

  @Post("me/clock-out")
  clockOut(@CurrentUser() user: any, @Req() request: Request, @Body() dto: ClockingDto) {
    return this.usersService.clockOut(user.id, request.ip, dto);
  }

  @Get("me/performance")
  getOwnPerformance(
    @CurrentUser() user: any,
    @CompanyContext() companyId: string,
    @ActivityContext() activityId?: string,
  ) {
    return this.usersService.getPerformance(user.id, companyId, activityId);
  }

  @Roles("super_admin", "admin_entreprise", "manager")
  @Post()
  create(@CurrentUser() actor: any, @Req() request: Request, @Body() dto: CreateUserDto) {
    return this.usersService.create(dto, actor, request.ip);
  }

  @Roles("super_admin", "admin_entreprise", "manager")
  @Get(":id")
  findOne(@Param("id") id: string, @CompanyContext() companyId: string) {
    return this.usersService.findOne(id, companyId);
  }

  @Roles("super_admin", "admin_entreprise", "manager")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @CompanyContext() companyId: string,
    @CurrentUser() actor: any,
    @Req() request: Request,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, companyId, dto, actor, request.ip);
  }

  @Roles("super_admin", "admin_entreprise")
  @Patch(":id/deactivate")
  deactivate(
    @Param("id") id: string,
    @CompanyContext() companyId: string,
    @CurrentUser() actor: any,
    @Req() request: Request,
  ) {
    return this.usersService.deactivate(id, companyId, actor, request.ip);
  }

  @Roles("super_admin", "admin_entreprise")
  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CompanyContext() companyId: string,
    @CurrentUser() actor: any,
    @Req() request: Request,
  ) {
    return this.usersService.remove(id, companyId, actor, request.ip);
  }

  @Roles("super_admin", "admin_entreprise", "manager")
  @Patch(":id/assignments")
  assignRoles(
    @Param("id") id: string,
    @CompanyContext() companyId: string,
    @CurrentUser() actor: any,
    @Req() request: Request,
    @Body() dto: AssignRolesDto,
  ) {
    return this.usersService.assignRoles(id, companyId, dto.assignments, actor, request.ip);
  }

  @Roles("super_admin", "admin_entreprise", "manager", "comptable")
  @Get(":id/performance")
  getPerformance(
    @Param("id") id: string,
    @CompanyContext() companyId: string,
    @ActivityContext() activityId?: string,
  ) {
    return this.usersService.getPerformance(id, companyId, activityId);
  }
}
