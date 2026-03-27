import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { UpdateCompanyStatusDto } from "./dto/update-company-status.dto";
import { CompaniesService } from "./companies.service";

@UseGuards(JwtAuthGuard)
@Controller("companies")
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Get("authorized")
  findAuthorized(@CurrentUser() user: any) {
    return this.companiesService.findAuthorizedForUser(user);
  }

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateCompanyStatusDto) {
    return this.companiesService.updateStatus(id, dto.statut);
  }
}
