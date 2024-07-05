import dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken';

export const SECRET_KEY = process.env.TOKEN_SECRET_KEY || ""

type TokenPayload = {
  user_id: number;
  email: string;
  scope: "biologist" | "citizen-scientist"
}

export const generateToken = (payload: TokenPayload) => {
  const options = {
    expiresIn: '1h', // Token expiration time
  };

  const token = jwt.sign(payload, SECRET_KEY, options);
  return token;
};
