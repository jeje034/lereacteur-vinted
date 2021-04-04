"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var formidableMiddelware = require("express-formidable");
var mongoose = require("mongoose");
var cloudinary = require("cloudinary").v2;
var cors = require("cors");
require("dotenv").config(); //=> le contenu du fichier .env va se trouver dans les variables d'environnement accessibles via process.env
var app = express();
app.use(formidableMiddelware());
app.use(cors());
//console.log(process.env);
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true, //Ajout pour éviter un warning car on a un modèle avec unique: true,
});
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
var userRoutes = require("./routes/user");
app.use(userRoutes);
var offerRoutes = require("./routes/offer");
app.use(offerRoutes);
var paymentRoutes = require("./routes/payment");
app.use(paymentRoutes);
app.all("*", function (req, res) {
    res.status(404).json({ error: { message: "Cette route n'existe pas49" } });
});
app.listen(process.env.PORT, function () {
    console.log("Server started.");
});
