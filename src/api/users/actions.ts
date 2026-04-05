import { RequestContext } from '@mikro-orm/core';
import { Role, IUser } from '../../infrastructure/mikro-orm/index.js';

export async function syncRoles(user: IUser, roleIds: string[]) {
  const em = RequestContext.getEntityManager()!;

  const roles = await em.find(Role, { id: { $in: roleIds } });

  user.roles.set(roles);

  await em.flush();

  return user;
}
