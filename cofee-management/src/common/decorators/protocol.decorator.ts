import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const protocol = createParamDecorator(
  (defaultValue: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return defaultValue || request.protocol;
  },
);
