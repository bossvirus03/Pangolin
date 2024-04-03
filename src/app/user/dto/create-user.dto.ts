import { IsEmail, IsNotEmpty, IsString, isNotEmpty } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  role: string;

  gender: string;

  @IsNotEmpty()
  type: string;

  status: string;

  resetPasswordExpires: Date;

  resetPasswordToken: string;
}
export class CreateUserCredentialDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  role?: string;

  status?: string;

  refresh_token?: string;
}
export class RegisterUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  name: string;

  gender: string;
}
