import { CoreException } from '../exceptions.js';


export class RoleNotFoundException extends CoreException {
  constructor() {
    super(404, 'Role not found.');
  }
}

export class RoleNameAlreadyExistsException extends CoreException {
  constructor() {
    super(409, 'Role name already exists.');
  }
}