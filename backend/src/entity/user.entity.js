"use strict";
import { DataTypes } from "sequelize";
import { sequelize } from "../config/configDb.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombreCompleto: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  rol: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "users",
  timestamps: true,
  indexes: [
    {
      name: "IDX_USER_EMAIL",
      unique: true,
      fields: ["email"],
    },
  ],
});

export default User;