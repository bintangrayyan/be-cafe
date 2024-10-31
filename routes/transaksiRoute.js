const express = require('express');
const app = express();

app.use(express.json());

const transaksiController = require(`../controllers/transaksiController`);
const { authorize } = require(`../middleware/authMiddleware`);
const roleMiddleware = require(`../middleware/roleMiddleware`);

app.get(`/transaksi`, transaksiController.getTransaksi);
app.get(
  '/transaksi/date/:startDate/:endDate',
  transaksiController.getDataByDateRange
);
app.post(
  `/transaksi`,
  [authorize],
  roleMiddleware('admin', 'kasir'),
  transaksiController.addTransaksi
);
app.put(
  `/transaksi/:id_transaksi`,
  [authorize],
  roleMiddleware('admin'),
  transaksiController.updateTransaksi
);
app.put(
  `/transaksi/status/:id_transaksi`,
  [authorize],
  transaksiController.updatestatus
);
app.delete(
  `/transaksi/:id_transaksi`,
  [authorize],
  roleMiddleware('admin'),
  transaksiController.deleteTransaksi
);
// app.get(`/transaksi/getmenu`, [authorize], transaksiController.getMenu);
app.get(`/transaksi/user/:id_user`, [authorize], transaksiController.getUser);
// app.get(
//   `/transaksi/namauser/:nama_user`,
//   [authorize],
//   transaksiController.getNamaUser
// );
// app.get(
//   `/transaksi/pendapatantgl/:tgl_transaksi`,
//   [authorize],
//   transaksiController.getPendapatanTgl
// );
// app.get(
//   `/transaksi/pendapatanbln/:tgl_transaksi`,
//   [authorize],
//   transaksiController.pendapatanBln
// );

module.exports = app;
