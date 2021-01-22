const express = require("express");
const formidableMiddelware = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
require("dotenv").config();

const app = express();

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

const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.all("*", (req, res) => {
    res.status(404).json({ error: { message: "Cette route n'existe pas" } });
});

app.listen(process.env.PORT, () => {
    console.log("Server started.");
});
