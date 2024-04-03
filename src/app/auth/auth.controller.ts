import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Request,
  Res,
  Param,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { Cookies, IsPublic } from "../lib/decorator/customize";
import { RegisterUserDto } from "../user/dto/create-user.dto";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @IsPublic()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  signIn(@Request() req, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(req.user, res);
  }

  @IsPublic()
  @Post("register")
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @IsPublic()
  @Get("refresh")
  async handleRefresh(
    @Cookies("refresh_token") refresh: string,
    @Res({ passthrough: true }) response: Response
  ) {
    return await this.authService.processNewToken(refresh, response);
  }
  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }

  @Get("logout")
  logout(@Request() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.logout(req.user, response);
  }

  @IsPublic()
  @Post("social-media")
  async socialMediaLogin(
    @Body() user,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.handleUserSocialMedia(user, res);
  }
  @IsPublic()
  @Post("forgot-password")
  async forgotPassword(@Body("email") email: string) {
    return this.authService.forgotPassword(email);
  }
  @IsPublic()
  @Post("reset-password/:token")
  async resetPassword(@Body("password") password, @Param() param) {
    return this.authService.resetPassword(param.token, password);
  }
}
