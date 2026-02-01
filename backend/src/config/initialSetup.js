"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

async function createUsers() {
  try {
    const count = await User.count();
    if (count > 0) return;

    await Promise.all([
      User.create({
        nombreCompleto: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        password: await encryptPassword(process.env.ADMIN_PASSWORD),
        rol: process.env.ADMIN_ROLE,
      }),
    ]);
    console.log("* => Usuarios creados exitosamente");
  } catch (error) {
    console.error("Error al crear usuarios:", error);
  }
}

export { createUsers };
