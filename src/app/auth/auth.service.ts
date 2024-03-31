import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto, RegisterUserDto } from "../user/dto/create-user.dto";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findUserByUsername(username);

    if (
      user &&
      (await this.userService.isValidPassword(password, user.password))
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  async login(
    username: string,
    pass: string
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findUserByUsername(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user._id, username: user.username, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
  async register(registerUserDto: RegisterUserDto): Promise<any> {
    return this.userService.register(registerUserDto);
  }
}
