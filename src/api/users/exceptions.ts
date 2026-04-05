import { CoreException } from "../exceptions.js";

export class UserNotFoundException extends CoreException {
    constructor() {
        super(404, `User not found`);
    }
}

export class UserEmailAlreadyExistsException extends CoreException {
    constructor() {
        super(409, `User email already exists`);
    }
}
