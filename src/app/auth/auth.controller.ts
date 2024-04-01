import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { Cookies, IsPublic } from "../lib/decorator/customize";
import { CreateUserDto, RegisterUserDto } from "../user/dto/create-user.dto";

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
  handleRefresh(
    @Cookies("refresh_token") refresh: string,
    @Res() response: Response
  ) {
    return this.authService.processNewToken(refresh, response);
  }
  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }

  @Get("logout")
  logout(@Request() req) {
    return this.authService.logout(req.user);
  }

  @IsPublic()
  @Post("social-media")
  async socialMediaLogin(
    @Body() user,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.handleUserSocialMedia(user, res);
  }
}
