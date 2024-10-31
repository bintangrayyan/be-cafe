const userModel = require(`../models/index`).user;
const transaksiModel = require(`../models/index`).transaksi;
const detailModel = require(`../models/index`).detail_transaksi;
const menuModel = require(`../models/index`).menu;
const mejaModel = require(`../models/index`).meja;
const { fn, col, literal } = require('sequelize');
const { Op } = require('sequelize');

exports.addTransaksi = async (request, response) => {
  try {
    let status = request.body.status || 'belum_bayar';

    let idMeja = request.body.id_meja;
    if (!idMeja) {
      let availableMeja = await mejaModel.findOne({
        where: { status: 'kosong' },
      });

      if (!availableMeja) {
        return response.json({
          status: false,
          message: 'Tidak ada meja kosong yang tersedia',
        });
      }

      idMeja = availableMeja.id_meja;
    }

    let transaksi = {
      tgl_transaksi: new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta',
      }),
      id_user: request.body.id_user,
      id_meja: idMeja,
      nama_pelanggan: request.body.nama_pelanggan,
      total_harga: request.body.total_harga,
      status: status,
    };

    let checkMeja = await mejaModel.findOne({
      where: { id_meja: transaksi.id_meja },
    });

    if (!checkMeja) {
      return response.json({
        status: false,
        message: 'Meja tidak ditemukan',
      });
    }

    if (checkMeja.status == 'terisi') {
      return response.json({
        status: false,
        message: 'Meja sedang terisi',
      });
    } else {
      let insertTransaksi = await transaksiModel.create(transaksi);

      let transaksiID = insertTransaksi.id_transaksi;
      let arrayDetail = request.body.detail_transaksi;

      if (arrayDetail) {
        for (let i = 0; i < arrayDetail.length; i++) {
          arrayDetail[i].id_transaksi = transaksiID;
        }

        await detailModel.bulkCreate(arrayDetail);
      }

      if (transaksi.status === 'belum_bayar') {
        await mejaModel.update(
          { status: 'terisi' },
          { where: { id_meja: transaksi.id_meja } }
        );
      }

      return response.json({
        status: true,
        insertTransaksi,
        message:
          'Data transaksi berhasil ditambahkan dengan harga pada detail_transaksi',
      });
    }
  } catch (error) {
    return response.json({
      status: false,
      message: error.message,
    });
  }
};

exports.updateTransaksi = async (request, response) => {
  try {
    const id_transaksi = request.params.id_transaksi;

    // Create a new data object based on the request body
    const newData = {
      tgl_transaksi: new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta',
      }),
      id_user: request.body.id_user,
      id_meja: request.body.id_meja,
      nama_pelanggan: request.body.nama_pelanggan,
      total_harga: request.body.total_harga,
      status: request.body.status,
    };

    const transaksi = await transaksiModel.findByPk(id_transaksi);
    if (!transaksi) {
      throw new Error('Transaksi not found.');
    }

    // Update the transaction
    await transaksiModel.update(newData, {
      where: { id_transaksi },
    });

    // Handle detail_transaksi updates if they exist
    const arrayDetail = request.body.detail_transaksi;
    if (arrayDetail) {
      // Update or insert detail_transaksi based on the provided data
      for (let i = 0; i < arrayDetail.length; i++) {
        arrayDetail[i].id_transaksi = id_transaksi;
      }
      // Bulk create or update details as necessary
      await detailModel.bulkCreate(arrayDetail, {
        updateOnDuplicate: ['qty', 'harga'],
      }); // Update harga juga jika ada
    }

    if (newData.status === 'lunas') {
      const id_meja = transaksi.id_meja;

      const [updated] = await Promise.all([
        mejaModel.update({ status: 'kosong' }, { where: { id_meja } }),
      ]);

      if (updated[0] === 0) {
        throw new Error('Failed to update meja status.');
      }
    }

    return response.json({
      status: true,
      message: 'Data transaksi berhasil diubah',
    });
  } catch (error) {
    return response.json({
      status: false,
      message: error.message,
    });
  }
};

exports.updatestatus = async (request, response) => {
  try {
    const id_transaksi = request.params.id_transaksi;
    const status = request.body.status;
    const id_meja = request.body.id_meja;

    // Update the status of the transaction
    await transaksiModel.update({ status }, { where: { id_transaksi } });

    if (status === 'lunas') {
      // Update the status of the meja to "kosong"
      const [updated] = await mejaModel.update(
        { status: 'kosong' },
        { where: { id_meja } }
      );
      if (!updated) {
        throw new Error('Failed to update meja status.');
      }
    }

    return response.json({
      status: true,
      message: 'Status transaksi berhasil diperbarui',
    });
  } catch (error) {
    return response.json({
      status: false,
      message: error.message,
    });
  }
};

exports.deleteTransaksi = async (request, response) => {
  try {
    let id_transaksi = request.params.id_transaksi;
    let id_transaksis = request.params.id_transaksi;
    let transakasis = await transaksiModel.findOne({
      where: {
        id_transaksi: id_transaksis,
      },
    });
    await detailModel.destroy({ where: { id_transaksi: id_transaksi } });
    await transaksiModel.destroy({ where: { id_transaksi: id_transaksi } });
    await mejaModel.update(
      { status: 'kosong' },
      { where: { id_meja: transakasis.id_meja } }
    );
    return response.json({
      status: true,
      message: 'Data transaksi berhasil dihapus',
    });
  } catch (error) {
    return response.json({
      status: false,
      message: error.message,
    });
  }
};

exports.getTransaksi = async (request, response) => {
  try {
    let result = await transaksiModel.findAll({
      include: [
        'meja',
        'user',
        {
          model: detailModel,
          as: 'detail_transaksi',
          include: ['menu'],
        },
      ],
      order: [['id_transaksi', 'DESC']],
    });
    return response.json({
      status: true,
      data: result,
    });
  } catch (error) {
    return response.json({
      status: false,
      message: error.message,
    });
  }
};

exports.getDataByDateRange = async (req, res) => {
  const { startDate, endDate } = req.params;

  try {
    // Parsing startDate dan endDate
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Set waktu awal ke 00:00:00

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Set waktu akhir ke 23:59:59.999

    // Query untuk mendapatkan data di rentang tanggal
    const result = await transaksiModel.findAll({
      where: {
        tgl_transaksi: {
          [Op.between]: [start, end],
        },
      },
      include: [
        'meja',
        'user',
        {
          model: detailModel,
          as: 'detail_transaksi',
          include: ['menu'],
        },
      ],
    });

    // Cek apakah data ditemukan
    if (result.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Data tidak ditemukan dalam rentang tanggal tersebut.',
      });
    } else {
      res.status(200).json({
        status: 'success',
        message: 'Data ditemukan.',
        data: result,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.getUser = async (request, response) => {
  try {
    let result = await transaksiModel.findAll({
      where: { id_user: request.params.id_user },
      include: [
        'meja',
        'user',
        {
          model: detailModel,
          as: 'detail_transaksi',
          include: ['menu'],
        },
      ],
      order: [['id_transaksi', 'DESC']],
    });
    return response.json({
      status: true,
      data: result,
    });
  } catch (error) {
    return response.json({
      status: false,
      message: error.message,
    });
  }
};

// exports.getNamaUser = async (req, res) => {
//   try {
//     const param = { nama_user: req.params.nama_user };
//     const userResult = await userModel.findAll({
//       where: {
//         nama_user: param.nama_user,
//       },
//     });
//     if (userResult.length == null) {
//       res.status(404).json({
//         status: "error",
//         message: "data tidak ditemukan",
//       });
//       return;
//     }
//     const transaksiResult = await transaksiModel.findAll({
//       where: {
//         id_user: userResult[0].id_user,
//       },
//     });
//     if (transaksiResult.length === 0) {
//       res.status(404).json({
//         status: "error",
//         message: "data tidak ditemukan",
//       });
//       return;
//     }
//     res.status(200).json({
//       status: "success",
//       message: "data ditemukan",
//       data: transaksiResult,
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

// exports.getMenu = async (req, res) => {
//   try {
//     const result = await detailModel.findAll({
//       attributes: [
//         'id_menu',
//         [fn("SUM", col("detail_transaksi.qty")), "qty"],
//       ],
//       include: [
//         {
//           model: menuModel,
//           as: 'menu'
//         }
//       ],
//       group: ["id_menu"],
//       order: [[literal("qty"), "DESC"]],
//     }); // mengambil semua data detail_transaksi
//     res.status(200).json({
//       status: "success",
//       data: result,
//     });
//   } catch (error) {
//     res.status(400).json({
//       message: error.message,
//     });
//   }
// };

// exports.getPendapatanTgl= async (req, res) => {
//   try{
//     const param = { tgl_transaksi: req.params.tgl_transaksi };
//     const result= await detailModel.findAll({
//       attributes: [
//         [fn('SUM', col('detail_transaksi.harga')), 'pendapatan']
//       ],
//       include: [
//         {
//           model: transaksiModel,
//           as: 'transaksi',
//           where: {
//             tgl_transaksi: {
//               [Op.between]: [
//                 param.tgl_transaksi + " 00:00:00",
//                 param.tgl_transaksi + " 23:59:59",
//               ],
//             }
//           },
//         }
//       ],
//       group: ['detail_transaksi.id_transaksi']
//     })
//       res.status(200).json({
//         status: "success",
//         data: result,
//         total_keseluruhan: result.reduce((a, b) => a + parseInt(b.dataValues.pendapatan), 0)
//       });
//   }catch(error) {
//       res.status(400).json({
//         status: "error",
//         message: error.message,
//       });
//     };
// };
// exports.pendapatanBln= async (req, res) => {
//   try{
//     const param = { tgl_transaksi: req.params.tgl_transaksi };
//     const result = await detailModel.findAll({
//       attributes: [
//         [fn('SUM', col('detail_transaksi.harga')), 'pendapatan']
//       ],
//       include: [
//         {
//           model: transaksiModel,
//           as: 'transaksi',
//           where: literal(MONTH(tgl_transaksi) = param.tgl_transaksi)
//         }
//       ],
//       group: ['detail_transaksi.id_transaksi']
//     })

//       res.status(200).json({
//         status: "success",
//         data: result,
//         total_keseluruhan: result.reduce((a, b) => a + parseInt(b.dataValues.pendapatan), 0)
//       });
//   }catch(error) {
//       res.status(400).json({
//         status: "error",
//         message: error.message,
// });
// };
// };
