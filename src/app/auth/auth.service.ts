import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { RegisterUserDto } from "../user/dto/create-user.dto";
import IUser from "../interfaces/user/user.interface";
import { ConfigService } from "@nestjs/config";
import ms from "ms";
import * as crypto from "crypto";
import { MailerService } from "@nestjs-modules/mailer";
@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
    private mailsService: MailerService
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
    const payload = {
      _id: user._id,
      sub: user._id,
      username: user.username,
      role: user.role,
    };
    const refreshToken = await this.createRefreshToken(payload);
    await res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE")),
    });
    await this.userService.updateRefreshToken(user._id, refreshToken);
    return {
      refresh_token: refreshToken,
      access_token: await this.jwtService.signAsync(payload),
      expires_in:
        Date.now() + ms(this.configService.get<string>("JWT_ACCESS_EXPIRE")),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        type: user.type,
        status: user.status,
      },
    };
  }
  async register(registerUserDto: RegisterUserDto): Promise<any> {
    const res = await this.userService.register(registerUserDto);
    return res;
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
    // console.log();
    if (checkAlreadyUser) {
      const payload = {
        _id: checkAlreadyUser._id,
        name: checkAlreadyUser.name,
        username: checkAlreadyUser.username,
        role: checkAlreadyUser.role,
        type: checkAlreadyUser.type,
        sub: checkAlreadyUser._id,
      };
      const refreshToken = this.createRefreshToken(payload);
      const update = await this.userService.updateRefreshToken(
        checkAlreadyUser._id,
        refreshToken
      );
      console.log("dfasdfasdf", update);
      return {
        refresh_token: refreshToken,
        expires_in:
          Date.now() + ms(this.configService.get<string>("JWT_ACCESS_EXPIRE")),
        access_token: this.jwtService.sign(payload),
        user: {
          _id: checkAlreadyUser._id,
          name: checkAlreadyUser.name,
          email: checkAlreadyUser.email,
          username: checkAlreadyUser.username,
          role: checkAlreadyUser.role,
          type: checkAlreadyUser.type,
        },
      };
    } else {
      const payload = {
        username: user.username,
        name: user.name,
        email: user.username,
        role: user.role,
        type: user.type,
        sub: user._id,
      };
      const refreshToken = this.createRefreshToken(payload);
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE")),
      });
      const newUser = await this.userService.createUserSocialMedia({
        username: user.username,
        name: user.name,
        email: user.username,
        role: user.role,
        type: user.type,
        status: "active",
        refresh_token: refreshToken,
      });
      return {
        refresh_token: refreshToken,
        expires_in:
          Date.now() + ms(this.configService.get<string>("JWT_ACCESS_EXPIRE")),
        access_token: this.jwtService.sign(payload),
        user: {
          _id: newUser._id,
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
      console.log(user);

      if (user) {
        const { username, _id, email, role, type } = user;
        const payload = {
          _id,
          username,
          type,
          role,
          sub: _id,
        };

        // create new token
        const newRefreshToken = this.createRefreshToken(payload);

        // res.clearCookie("refresh_token");
        // res.cookie("refresh_token", newRefreshToken);
        //update user with refresh token
        await this.userService.updateRefreshToken(user._id, newRefreshToken);
        const access_token = await this.jwtService.signAsync(payload);
        return {
          access_token: access_token,
          expires_in:
            Date.now() +
            ms(this.configService.get<string>("JWT_ACCESS_EXPIRE")),
          refresh_token: newRefreshToken,
          user: { _id, role, email, username },
        };
      } else {
        throw new UnauthorizedException(global.getLang("InvalidAccessToken"));
      }
    } catch (error) {
      throw new UnauthorizedException(global.getLang("InvalidAccessToken"));
    }
  }

  async logout(user: IUser, response) {
    console.log(user);
    const update = await this.userService.updateRefreshToken(user._id, null);
    console.log(update);
    response.clearCookie("refresh_token");
    return {
      statusCode: 200,
      message: "OK",
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const resetPasswordToken = crypto.randomBytes(20).toString("hex"); // Tạo một mã xác thực ngẫu nhiên
    const resetPasswordExpires = new Date(Date.now() + 3600000); // Tạo một thời gian hết hạn sau 1 giờ

    await this.userService.update(user._id, {
      resetPasswordExpires,
      resetPasswordToken,
    });

    const mailOptions = {
      to: user.email,
      from: "no_reply@example.com", // replace with your email
      subject: "Password Reset",
      template: "./forgotPassword",
      context: {
        port: "3000",
        token: resetPasswordToken,
      },
    };

    await this.mailsService.sendMail(mailOptions);
    return {
      statusCode: 200,
      message: "OK",
    };
  }

  async resetPassword(token, newPassword) {
    const user = await this.userService.findByResetPasswordToken(token);
    const newDate = new Date(Date.now());
    if (!user || user.resetPasswordExpires < newDate) {
      throw new BadRequestException("Invalid or expired token");
    }

    const updateDto = {
      password: await this.userService.genHashPassword(newPassword),
      resetPasswordToken: null,
      resetPasswordExpires: null,
    };
    await this.userService.update(user._id, updateDto);
    return {
      message: "Reset Password Successfully!",
      statusCode: 200,
    };
  }
}
