import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";
import type { LoginInput, SignupInput, VerifyOtpInput } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  signup(@Body() body: SignupInput) {
    return this.authService.signup(body);
  }

  @Post("login")
  login(@Body() body: LoginInput) {
    return this.authService.login(body);
  }

  @Post("verify")
  verifyOtp(@Body() body: VerifyOtpInput) {
    return this.authService.verifyOtp(body);
  }
}
