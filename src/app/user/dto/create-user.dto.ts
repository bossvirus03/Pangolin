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
}
export class CreateUserCredentialDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  type: string;
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
