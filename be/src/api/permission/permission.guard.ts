import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { PERMISSION_METADATA } from '../../share/common/app.const';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const routePermissions = this.reflector.get<string[]>(
      PERMISSION_METADATA,
      context.getHandler(),
    );

    const { user } = context.switchToHttp().getRequest();
    const userPermissions = new Set();
    user?.role?.forEach((r) => {
      r?.permissions?.forEach((p) => {
        userPermissions.add(p.name);
      });
    });
    if (user?.isSuperAdmin) return true;

    return routePermissions?.some((routePermission) =>
      [...userPermissions].includes(routePermission),
    );
  }
}
