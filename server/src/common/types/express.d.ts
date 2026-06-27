import type { NeonAuthUser } from '../../modules/auth/auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: NeonAuthUser;
    }
  }
}

export {};
