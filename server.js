const express = require('express');
const dotEnv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const dbConnection = require('./database/connection');
const fs = require('fs');
const https = require('https');
var cron = require('node-cron');
const userController = require("./controller/userController");

dotEnv.config();

const app = express();

const cert = fs.readFileSync('./certs/www_dhakarecord_online.crt');
const ca = fs.readFileSync('./certs/ca-bundle.crt');
const key = fs.readFileSync('./certs/dhakarecord.key');


// db connectivity
dbConnection();

// cors
app.use(cors());

// request payload middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let options = {
   cert: cert,
   key: key,
   //ca : ca
};


app.use('/api/v1/product', require('./routes/productRoutes'));
app.use('/api/v1/user', require('./routes/userRoutes'));
app.use('/api/v1/home', require('./routes/homeRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/song', require('./routes/songRoutes'));

app.get('/', (req, res, next) => {
  res.send('Hello from Node API Server');
});
app.use('/uploads', express.static("./uploads"));
const PORT = process.env.PORT || 3000;

//const httpsServer = https.createServer(options, app);
//httpsServer.listen(PORT);

//const httpsServer = https.createServer(options, app);
//httpsServer.listen(PORT);

app.listen(PORT, () => {
 console.log(`Server listening on port ${PORT}`);
});

cron.schedule('0 0 1 * * *', () => {
  userController.subscription_exired();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});


// error handler middleware
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send({
    status: 500,
    message: err.message,
    body: {}
  });
})