import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return {
      ok: true,
      service: "12th-cauldron-backend",
      timestamp: new Date().toISOString(),
    };
  }
}
