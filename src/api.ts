import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from "jsonwebtoken";

import { apiController } from './routes';
import { SECRET_KEY } from './auth/jwtUtils';

const api = express();

api.use(express.json())
api.use(express.static('static'))
api.use(cors())
api.use('/', apiController)

export function validateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, SECRET_KEY, (err, payload) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid token',
        });
      } else {
        //@ts-ignore
        req.user = payload;
        next();
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'User is not authorized',
    });
  }
}

export { api }
