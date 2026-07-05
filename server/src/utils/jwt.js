import jwt from "jsonwebtoken";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
};

export const generateToken = (userId, email, role) => {
  return jwt.sign({ id: userId, email, role }, getSecret(), {
    expiresIn: "7d",
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, getSecret());
};
