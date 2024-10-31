const express = require(`express`);
const app = express();

const menuController = require(`../controllers/menuController`);
const { authorize } = require(`../middleware/authMiddleware`);
const roleMiddleware = require(`../middleware/roleMiddleware`);

app.get(`/menu`, menuController.getMenu);
app.post(`/menu`, [authorize], roleMiddleware('admin'), menuController.addMenu);
app.post(
  `/menu/find`,
  [authorize],
  roleMiddleware('admin', 'kasir'),
  menuController.filterMenu
);
app.put(
  `/menu/:id_menu`,
  [authorize],
  roleMiddleware('admin'),
  menuController.updateMenu
);
app.delete(
  `/menu/:id_menu`,
  [authorize],
  roleMiddleware('admin'),
  menuController.deleteMenu
);

module.exports = app;
