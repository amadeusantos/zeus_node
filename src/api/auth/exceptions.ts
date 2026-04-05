import { CoreException } from '../exceptions.js';

export class InvalidCredentialsException extends CoreException {
  constructor() {
    super(401, 'Invalid email or password');
  }
}

export class UserInactiveException extends CoreException {
  constructor() {
    super(403, 'User account is inactive');
  }
}
