import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ActivityContext } from "../../common/decorators/activity-context.decorator";
import { CompanyContext } from "../../common/decorators/company-context.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ScopeGuard } from "../../common/guards/scope.guard";
import { CreateExpenseCategoryDto } from "./dto/create-expense-category.dto";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { FinanceReportQueryDto } from "./dto/finance-report-query.dto";
import { FinanceService } from "./finance.service";

@UseGuards(JwtAuthGuard, ScopeGuard, RolesGuard)
@Controller("finance")
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get("dashboard")
  dashboard(@CompanyContext() companyId: string, @Query() query: FinanceReportQueryDto) {
    return this.financeService.dashboard(companyId, query);
  }

  @Get("report")
  report(@CompanyContext() companyId: string, @Query() query: FinanceReportQueryDto) {
    return this.financeService.report(companyId, query);
  }

  @Get("expense-categories")
  expenseCategories(@CompanyContext() companyId: string) {
    return this.financeService.expenseCategories(companyId);
  }

  @Post("expense-categories")
  @Roles("super_admin", "admin_entreprise", "manager", "comptable")
  createExpenseCategory(@CompanyContext() companyId: string, @Body() dto: CreateExpenseCategoryDto) {
    return this.financeService.createExpenseCategory({
      ...dto,
      companyId,
    });
  }

  @Get("expenses")
  expenses(@CompanyContext() companyId: string, @Query() query: FinanceReportQueryDto) {
    return this.financeService.expenses(
      companyId,
      query.activityId,
      query.from ? new Date(query.from) : undefined,
      query.to ? new Date(query.to) : undefined,
    );
  }

  @Post("expenses")
  @Roles("super_admin", "admin_entreprise", "manager", "comptable")
  createExpense(
    @CompanyContext() companyId: string,
    @ActivityContext() activityId: string | undefined,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.financeService.createExpense({
      ...dto,
      companyId,
      activityId: dto.activityId ?? activityId,
    });
  }
}
