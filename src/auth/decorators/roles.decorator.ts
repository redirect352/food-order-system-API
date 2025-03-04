import { SetMetadata } from '@nestjs/common';
import { user_role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: user_role[]) => {
  const additionalRoles: user_role[] = [];
  roles.forEach((role) => {
    const allowed = allowedInterfaces[role];
    if (allowed.length > 0) additionalRoles.push(...allowed);
  });
  const final = [...new Set([...roles, ...additionalRoles])];
  return SetMetadata(ROLES_KEY, final);
};

export const allowedInterfaces: Record<user_role, user_role[]> = {
  client: ['client', 'menu_moderator', 'admin'],
  deliveryman: [],
  order_issuing: [],
  menu_moderator: ['menu_moderator', 'admin'],
  CExport: [],
  admin: [],
};
