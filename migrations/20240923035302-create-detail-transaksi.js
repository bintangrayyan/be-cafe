'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('detail_transaksi', {
      id_detail_transaksi: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_transaksi: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'transaksi',
          key: 'id_transaksi',
        },
      },
      id_menu: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'menu',
          key: 'id_menu',
        },
      },
      harga: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      qty: {
        allowNull: false,
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('detail_transaksi');
  },
};
