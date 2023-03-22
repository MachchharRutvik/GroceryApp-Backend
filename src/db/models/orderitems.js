'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItems extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OrderItems.init({
    order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    product_name: DataTypes.STRING,
    qty: DataTypes.FLOAT,
    product_amount: DataTypes.FLOAT,
    discount_type: DataTypes.INTEGER,
    discount_amount: DataTypes.FLOAT,
    deleted_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'OrderItems',
    underscored: true,
    paranoid: true,
    deletedAt: 'deleted_at',
  });
  return OrderItems;
};