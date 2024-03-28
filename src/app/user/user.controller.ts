import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "src/database/models/userModel";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":uid")
  async findById(@Param("uid") uid: string): Promise<User> {
    return this.userService.findByUid(uid);
  }
  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Post()
  async createUser(@Body() userData: Partial<User>): Promise<User> {
    return this.userService.createUser(userData);
  }
}
