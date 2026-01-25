"use strict";
import User from "../entity/user.entity.js";
import jwt from "jsonwebtoken";
import { comparePassword } from "../helpers/bcrypt.helper.js";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";

export async function loginService(user) {
  const { email, password } = user;

  const userFound = await User.findOne({
    where: { email }
  });

  if (!userFound) {
    const error = new Error("El correo electrónico es incorrecto");
    error.statusCode = 400;
    error.dataInfo = "email";
    throw error;
  }

  const isMatch = await comparePassword(password, userFound.password);

  if (!isMatch) {
    const error = new Error("La contraseña es incorrecta");
    error.statusCode = 400;
    error.dataInfo = "password";
    throw error;
  }

  const payload = {
    nombreCompleto: userFound.nombreCompleto,
    email: userFound.email,
    rol: userFound.rol,
  };

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });

  return accessToken;
}
