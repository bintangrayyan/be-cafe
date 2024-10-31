const express = require(`express`);
const app = express();

app.use(express.json());

const userController = require(`../controllers/userController`);
const { authorize } = require(`../middleware/authMiddleware`);
const roleMiddleware = require(`../middleware/roleMiddleware`);

app.get(`/user`, userController.getUser);
app.get(`/user/:role`, [authorize], userController.roleUser);
app.post(
  `/user/find`,
  [authorize],
  roleMiddleware('admin'),
  userController.findUser
);
app.post(`/user`, [authorize], roleMiddleware('admin'), userController.addUser);
app.put(
  `/user/:id_user`,
  [authorize],
  roleMiddleware('admin'),
  userController.updateUser
);
app.delete(
  `/user/:id_user`,
  [authorize],
  roleMiddleware('admin'),
  userController.deleteUser
);

module.exports = app;
