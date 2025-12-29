import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload | any; // Định nghĩa lại user tùy theo payload token của bạn
    }
  }
}
