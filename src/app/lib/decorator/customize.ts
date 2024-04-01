import { SetMetadata } from "@nestjs/common";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : request.cookies;
  }
);
