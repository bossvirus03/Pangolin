import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Request,
  Res,
  Param,
  Req,
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
  @Post("refresh")
  async handleRefresh(
    @Body("refresh_token") refresh,
    @Res({ passthrough: true }) response
  ) {
    // const refresh = request.cookies["refresh_token"];
    // console.log(JSON.stringify(refresh));
    return await this.authService.processNewToken(refresh, response);
  }
  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }

  @Get("logout")
  logout(@Request() req, @Res({ passthrough: true }) response: Response) {
    console.log("run logout");
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
