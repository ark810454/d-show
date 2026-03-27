import { Module } from "@nestjs/common";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ScopeGuard } from "../../common/guards/scope.guard";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService, RolesGuard, ScopeGuard],
  exports: [UsersService],
})
export class UsersModule {}
