const express = require("express");
const dotenv = require('dotenv');
const { default: mongoose } = require("mongoose");
const routes = require("./backend/routes");
const cors = require('cors');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
dotenv.config()

const app = express()
const port = process.env.PORT || 3001
app.use(bodyParser.json())
app.use(cookieParser());
app.use(cors());

routes(app);

mongoose.connect(`mongodb+srv://22520734:${process.env.MONGO_DB}@bus.cujvx.mongodb.net/?retryWrites=true&w=majority&appName=Bus`)
    .then(()=> {
        console.log('Database connection successful!')
    })
    .catch((err) => {
        console.error('Database connection error:', err)
    })

app.listen(port, () => {
    console.log('Server is running on port:', port)
})





// const express = require('express')
// const app = express()
// const mongoose = require('mongoose')
// const dotenv = require('dotenv')
// const cors = require('cors')
// const path = require('path')
//
// dotenv.config()
//
// if (process.env.NODE_ENV === 'local') {
//     app.use(cors({
//         origin: 'http://localhost:3000',
//         credentials: true
//     }))
// } else {
//     app.use(cors({
//         credentials: true
//     }))
// }
//
// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, "./frontend/dist")))
//     app.get('*',(req,res) => {
//         res.sendFile(path.resolve(__dirname, "./", "frontend", "dist","index.html"))
//     })
// }
//
//
// const dbConnect = async () => {
//     try {
//         if (process.env.NODE_ENV === 'local') {
//             await mongoose.connect(process.env.LOCAL_DB_URI)
//             console.log('Local Database Is Connected..')
//         } else {
//             await mongoose.connect(process.env.MONGODB_URI)
//             console.log('Production Database Is Connected..')
//         }
//
//     } catch (error) {
//         console.log('Database connection Failed.')
//     }
// }
// dbConnect()
//
// const PORT = process.env.PORT
// app.listen(PORT, () => console.log(`Server is running on port ${PORT}..`));
