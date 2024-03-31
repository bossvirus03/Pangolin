import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { IsPublic } from "../lib/decorator/customize";
import { CreateUserDto, RegisterUserDto } from "../user/dto/create-user.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @IsPublic()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  signIn(@Request() req) {
    return this.authService.login(req.user.username, req.user.password);
  }

  @IsPublic()
  @Post("register")
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }
}
