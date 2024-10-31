'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menu', {
      id_menu: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama_menu: {
        allowNull: false,
        type: Sequelize.STRING
      },
      jenis: {
        allowNull: false,
        type: Sequelize.ENUM('makanan', 'minuman')
      },
      deskripsi: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      gambar: {
        allowNull: false,
        type: Sequelize.STRING
      },
      harga: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('menu');
  }
};