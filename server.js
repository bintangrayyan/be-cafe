const express = require(`express`);
const app = express();

const PORT = 3000;
const cors = require(`cors`);
app.use(express.static(__dirname));
const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const user = require(`./routes/userRoute`);
const auth = require(`./routes/authRoute`);
const menu = require('./routes/menuRoute');
const meja = require('./routes/mejaRoute');
const transaksi = require  ('./routes/transaksiRoute')

app.use(auth);
app.use(user);
app.use(menu);
app.use(meja);
app.use(transaksi);

app.listen(PORT, () => {
  console.log(`Connected! Port : ${PORT}`);
});
