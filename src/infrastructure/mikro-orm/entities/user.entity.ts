import { defineEntity, type InferEntity, p } from '@mikro-orm/core';
import { Role } from './role.entity.js';
import { randomUUID } from 'crypto';

export const User = defineEntity({
  name: 'users',
  properties: {
    id: p.uuid().primary().onCreate(() => randomUUID()),
    full_name: p.string().length(256),
    email: p.string().unique().index(),
    password: p.string(),
    active: p.boolean().default(true).index(),
    is_admin: p.boolean().default(false).index(),
    roles: () => p.manyToMany(Role).pivotTable('user_roles'),
  },
});

export type IUser = InferEntity<typeof User>;