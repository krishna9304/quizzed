import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Teacher } from './users/schemas/Teacher.schema';
import { User } from './users/schemas/user.schema';

export const getCurrentUserByContext = (
  context: ExecutionContext,
): User | Teacher => {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest().user;
  }
  if (context.getType() === 'rpc') {
    return context.switchToRpc().getData().user;
  }
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
