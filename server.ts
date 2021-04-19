//index.ts a été découpé en index.ts et server.ts afin de pouvoir exécuter les tests avec Jest et Supertest

import express, { Application, Request, Response } from "express";
const formidableMiddelware = require("express-formidable");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
require("dotenv").config(); //=> le contenu du fichier .env va se trouver dans les variables d'environnement accessibles via process.env

export const app: Application = express();

app.use(formidableMiddelware());
app.use(cors());

//console.log(process.env);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

const paymentRoutes = require("./routes/payment");
app.use(paymentRoutes);

app.all("*", (req: Request, res: Response) => {
    res.status(404).json({ error: { message: "Cette route n'existe pas" } });
});
