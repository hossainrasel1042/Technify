import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;
if (!SECRET) throw new Error("Missing JWT_SECRET in environment variables.");

export interface TokenPayload {
  id: string; // UUID
}

export function signToken(id: string, options: SignOptions = { expiresIn: "7d" }): string {
  return jwt.sign({ id }, SECRET, options);
}

export function verifyToken(token: string): (JwtPayload & TokenPayload) | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload & TokenPayload;
  } catch {
    return null;
  }
}