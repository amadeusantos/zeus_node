import { CoreException } from '../exceptions.js';

export class InvalidCredentialsException extends CoreException {
  constructor() {
    super(401, 'Invalid email or password');
  }
}

