"use strict";
import User from "../entity/user.entity.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { Op } from "sequelize";

export async function getUserService(query) {
  const { id, email } = query;

  const userFound = await User.findOne({
    where: {
      [Op.or]: [
        id ? { id: id } : null,
        email ? { email: email } : null,
      ].filter(Boolean)
    },
  });

  if (!userFound) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const { password, ...userData } = userFound.toJSON();
  return userData;
}

export async function getUsersService() {
  const users = await User.findAll({
    attributes: { exclude: ['password'] }
  });

  if (!users || users.length === 0) {
    const error = new Error("No hay usuarios");
    error.statusCode = 404;
    throw error;
  }

  return users;
}

export async function updateUserService(query, body) {
  const { id, email } = query;

  const userFound = await User.findOne({
    where: {
      [Op.or]: [
        id ? { id: id } : null,
        email ? { email: email } : null,
      ].filter(Boolean)
    },
  });

  if (!userFound) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const existingUser = await User.findOne({
    where: {
      email: body.email,
      id: { [Op.ne]: userFound.id }
    },
  });

  if (existingUser) {
    const error = new Error("Ya existe un usuario con el mismo email");
    error.statusCode = 400;
    throw error;
  }

  if (body.password) {
    const matchPassword = await comparePassword(
      body.password,
      userFound.password,
    );

    if (!matchPassword) {
      const error = new Error("La contraseña no coincide");
      error.statusCode = 400;
      throw error;
    }
  }

  const dataUserUpdate = {
    nombreCompleto: body.nombreCompleto,
    email: body.email,
    rol: body.rol,
  };

  if (body.newPassword && body.newPassword.trim() !== "") {
    dataUserUpdate.password = await encryptPassword(body.newPassword);
  }

  await userFound.update(dataUserUpdate);

  const { password, ...userUpdated } = userFound.toJSON();
  return userUpdated;
}

export async function deleteUserService(query) {
  const { id, email } = query;

  const userFound = await User.findOne({
    where: {
      [Op.or]: [
        id ? { id: id } : null,
        email ? { email: email } : null,
      ].filter(Boolean)
    },
  });

  if (!userFound) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (userFound.rol === "administrador") {
    const error = new Error("No se puede eliminar un usuario con rol de administrador");
    error.statusCode = 400;
    throw error;
  }

  const { password, ...dataUser } = userFound.toJSON();
  await userFound.destroy();
  return dataUser;
}