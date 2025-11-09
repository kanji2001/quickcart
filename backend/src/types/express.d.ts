import { UserDocument } from './user';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
      authToken?: string;
    }
  }
}

