import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto, RegisterUserDto } from "../user/dto/create-user.dto";
import IUser from "../interfaces/user/user.interface";
import { ConfigService } from "@nestjs/config";
import ms from "ms";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
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
  async login(user, res) {
    const payload = { sub: user._id, username: user.username, role: user.role };
    const refreshToken = await this.createRefreshToken(payload);
    await res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE")),
    });
    await this.userService.updateRefreshToken(user._id, refreshToken);
    return {
      refresh_token: refreshToken,
      access_token: await this.jwtService.signAsync(payload),
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        type: user.type,
        status: user.status,
      },
    };
  }
  async register(registerUserDto: RegisterUserDto): Promise<any> {
    return this.userService.register(registerUserDto);
  }

  createRefreshToken(payload: any) {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
      expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRE"),
    });
    return refresh_token;
  }

  async handleUserSocialMedia(user, res) {
    const checkAlreadyUser = await this.userService.findUserByUsername(
      user.username
    );
    if (checkAlreadyUser) {
      const payload = {
        username: checkAlreadyUser.username,
        role: checkAlreadyUser.role,
        type: checkAlreadyUser.type,
        sub: checkAlreadyUser._id,
      };
      const refreshToken = this.createRefreshToken(payload);
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE")),
      });
      this.userService.updateRefreshToken(user._id, refreshToken);
      return {
        refresh_token: refreshToken,
        access_token: this.jwtService.sign(payload),
        user: {
          username: checkAlreadyUser.username,
          role: checkAlreadyUser.role,
          type: checkAlreadyUser.type,
          sub: checkAlreadyUser._id,
        },
      };
    } else {
      const newUser = await this.userService.createUserSocialMedia(user);
      const payload = {
        username: newUser.username,
        role: newUser.role,
        type: newUser.type,
        sub: newUser._id,
      };
      const refreshToken = this.createRefreshToken(payload);
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE")),
      });
      this.userService.updateRefreshToken(user._id, refreshToken);
      return {
        refresh_token: refreshToken,
        access_token: this.jwtService.sign(payload),
        user: {
          username: newUser.username,
          role: newUser.role,
          type: newUser.type,
          sub: newUser._id,
        },
      };
    }
  }
  async processNewToken(refreshToken, res) {
    try {
      //verify that the refresh token
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
      });

      //get user
      const user = await this.userService.findUserToken(refreshToken);

      if (user) {
        const { username, _id, email, role, type } = user;
        const payload = {
          username,
          type,
          role,
          sub: _id,
        };

        // create new token
        const newRefreshToken = this.createRefreshToken(payload);

        res.clearCookie("refresh_token");
        res.cookie("refresh_token", newRefreshToken);
        //update user with refresh token
        await this.userService.updateRefreshToken(user._id, newRefreshToken);

        return {
          access_token: this.jwtService.sign(payload),
          refreshToken: newRefreshToken,
          user: { _id, role, email, username },
        };
      } else {
        throw new UnauthorizedException(global.getLang("InvalidAccessToken"));
      }
    } catch (error) {
      throw new UnauthorizedException(global.getLang("InvalidAccessToken"));
    }
  }

  async logout(user: IUser) {
    await this.userService.updateRefreshToken(user._id, null);
    return {
      statusCode: 200,
      message: "OK",
    };
  }
}
