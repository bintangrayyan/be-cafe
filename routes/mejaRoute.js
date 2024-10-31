const express = require(`express`);
const app = express();

app.use(express.json());

const { authorize } = require(`../middleware/authMiddleware`);
const mejaController = require(`../controllers/mejaController`);
const roleMiddleware = require(`../middleware/roleMiddleware`);

app.get(`/meja`, mejaController.getMeja);
app.get(
  `/status/:status`,
  [authorize],
  roleMiddleware('admin'),
  mejaController.statusMeja
);
app.post(`/meja`, [authorize], roleMiddleware('admin'), mejaController.addMeja);
app.put(
  `/meja/:id_meja`,
  [authorize],
  roleMiddleware('admin', 'kasir'),
  mejaController.updateMeja
);
app.delete(
  `/meja/:id_meja`,
  [authorize],
  roleMiddleware('admin'),
  mejaController.deleteMeja
);

module.exports = app;
