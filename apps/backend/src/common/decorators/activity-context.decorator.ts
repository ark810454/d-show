import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const ActivityContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers["x-activity-id"] as string | undefined;
  },
);

