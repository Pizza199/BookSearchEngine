import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string,
}

export const authenticateToken = ({req}: any) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return req;
  }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return req;
    }

    const secretKey = process.env.JWT_SECRET_KEY || '';

    try {
      const decoded = jwt.verify(token, secretKey) as JwtPayload;
      req.user = decoded;
      return req;
    } catch (error) {
      return req;
    }
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};
