const express = require("express");
const dotenv = require('dotenv');
const { default: mongoose } = require("mongoose");
const routes = require("./backend/routes");
const cors = require('cors');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const db = require("./backend/config/database");
dotenv.config()

const app = express()
const port = process.env.PORT || 3001

app.use(
    cors({
        origin: "http://localhost:3000", // Địa chỉ front-end
        credentials: true, // Cho phép gửi cookies
      })
);
app.use(bodyParser.json())
app.use(cookieParser());

routes(app);

db.connect();

app.listen(port, () => {
    console.log('Server is running on port:', port)
})

