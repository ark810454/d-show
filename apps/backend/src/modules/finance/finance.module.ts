import { Module } from "@nestjs/common";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ScopeGuard } from "../../common/guards/scope.guard";
import { FinanceController } from "./finance.controller";
import { FinanceService } from "./finance.service";

@Module({
  controllers: [FinanceController],
  providers: [FinanceService, RolesGuard, ScopeGuard],
})
export class FinanceModule {}
