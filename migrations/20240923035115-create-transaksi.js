"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("transaksi", {
      id_transaksi: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tgl_transaksi: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      id_user: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references:{
          model:'user',
          key:'id_user'
        }
      },
      id_meja: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references:{
          model:'meja',
          key:'id_meja'
        }
      },
      nama_pelanggan: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      total_harga: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM("belum_bayar", "lunas"),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("transaksi");
  },
};
