const express = require(`express`);
const app = express();
app.use(express.json());
const { authenticate } = require(`../middleware/authMiddleware`);
app.post(`/auth`, authenticate);
module.exports = app;
