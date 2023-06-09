"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class payment_status_master extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  payment_status_master.init(
    {
      title: DataTypes.STRING,
      deleted_at: DataTypes.DATE,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "payment_status_master",
      underscored: true,
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );
  return payment_status_master;
};
