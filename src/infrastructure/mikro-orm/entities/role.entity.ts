import { defineEntity, type InferEntity, p } from "@mikro-orm/core";
import { randomUUID } from "crypto";

export const Role = defineEntity({
    name: 'roles',
    properties: {
        id: p.uuid().primary().onCreate(() => randomUUID()),
        name: p.string().length(128).unique().index(),
        description: p.string(),
        active: p.boolean().default(true),
    },
});

export type IRole = InferEntity<typeof Role>;