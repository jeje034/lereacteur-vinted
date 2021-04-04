export {};
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

import { Request, Response } from "express";

//const Transaction = require("../models/Transaction");

router.post("/payment", async (req: any, res: Response) => {
    try {
        const {
            stripeToken, //Récupération par destructuring du token créé depuis le Frontend via l'API Stripe
            amount,
            productName,
        } = req.fields;

        if (!stripeToken || !amount || !productName) {
            res.status(400).json({
                error: { message: "Missing parameters." },
            });
            return;
        }

        // Création la transaction via Stripe
        const response = await stripe.charges.create({
            amount: Number(amount) * 100, //Montant en centimes. msgjs21 si temps rechercher avec l'id du produit
            currency: "eur",
            description: productName,
            source: stripeToken,
        });

        //console.log(response.status);

        // msgjs21 : Sauvegarder la transaction dans une BDD MongoDB

        res.status(200).json(response);
    } catch (error) {
        if (error.raw && error.raw.message) {
            console.log("An error occurs :", error.raw.message, error);
        } else {
            console.log("An error occurs :", error.message, error);
        }
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
