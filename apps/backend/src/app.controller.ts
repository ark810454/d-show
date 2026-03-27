import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("health")
  health() {
    return {
      service: "D_Show API",
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}

