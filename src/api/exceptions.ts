export class CoreException extends Error {
  constructor(readonly statusCode: number, readonly message: string) {
    super(message);
    this.name = 'CoreException';
  }
}

export class NotAuthenticatedException extends CoreException {
  constructor() {
    super(401, 'Not authenticated');
  }
}

export class TokenInvalidException extends CoreException {
  constructor() {
    super(401, 'Token is invalid or expired');
  }
}

export class ForbiddenException extends CoreException {
  constructor() {
    super(403, 'User not authorized');
  }
}
