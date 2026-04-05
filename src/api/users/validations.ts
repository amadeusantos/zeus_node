import { RequestContext } from "@mikro-orm/core";
import { User } from "../../infrastructure/mikro-orm/entities/user.entity.js";
import { UserEmailAlreadyExistsException } from "./exceptions.js";

export async function validateEmail(email: string) {
    const user = await RequestContext.getEntityManager()!.findOne(User, { email });

    if (user) {
        throw new UserEmailAlreadyExistsException();
    }
}
