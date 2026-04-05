import { RequestContext } from "@mikro-orm/core";
import { Role } from "../../infrastructure/mikro-orm/entities/role.entity.js";
import { RoleNameAlreadyExistsException } from "./exceptions.js";

export async function validateName(name: string) {
    const role = await RequestContext.getEntityManager()!.findOne(Role, { name });

    if (role) {
        throw new RoleNameAlreadyExistsException();
    }
}
