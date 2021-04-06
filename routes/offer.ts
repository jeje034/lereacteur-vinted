const { Router } = require("express");
const express = require("express");
const { route } = require("./user");
const router = express.Router();

const User = require("../models/User");
const Offer = require("../models/Offer");

const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middlewares/is-authenticated");
import { NextFunction, Request, Response } from "express";

const areParametersOK = (req: any, res: Response, next: NextFunction) => {
    if (req.fields.title && req.fields.title.length > 50) {
        res.status(400).json({
            error: { message: "Le titre est limité à 50 caractères." },
        });
        return;
    }

    if (req.fields.title && req.fields.description.length > 500) {
        res.status(400).json({
            error: { message: "La description est limitée à 500 caractères." },
        });
        return;
    }

    if (req.fields.price) {
        let price = Number.parseInt(req.fields.price);
        if (!isNaN(price) && price > 100000) {
            res.status(400).json({
                error: {
                    message: "Le prix est limité à 100000 €.",
                },
            });
            return;
        }
    }

    next();
};

router.post(
    "/offer/publish",
    isAuthenticated,
    areParametersOK,
    async (req: any, res: Response) => {
        try {
            // Destructuring
            const {
                title,
                description,
                price,
                size,
                brand,
                condition,
                city,
                color,
            } = req.fields;

            // Créer une nouvelle annonce
            const newOffer = new Offer({
                product_name: title,
                product_description: description,
                product_price: price,
                product_details: [
                    {
                        MARQUE: brand,
                    },
                    {
                        TAILLE: size,
                    },
                    {
                        ÉTAT: condition,
                    },
                    {
                        COULEUR: color,
                    },
                    {
                        EMPLACEMENT: city,
                    },
                ],
                // Pour faire une réf je peux soit envoyer l'id, soit envoyer le document complet
                owner: req.user,
            });

            if (req.files.picture) {
                const productImageInformations = await cloudinary.uploader.upload(
                    req.files.picture.path,
                    { folder: "/vinted/offers/" + newOffer._id }
                );
                newOffer.product_image = productImageInformations;
            }

            await newOffer.save();

            res.status(200).json(newOffer);
        } catch (error) {
            res.status(400).json({ error: { message: error.message } });
        }
    }
);

const updateProductDetail = (
    offer: typeof Offer,
    productDetailId: string,
    productDetailValue: string
) => {
    if (!productDetailValue) {
        return;
    }

    let position1;
    let position2 = -1;

    for (let i = 0; i < offer.product_details.length; i++) {
        position1 = Object.keys(offer.product_details[i]).indexOf(
            productDetailId
        );

        if (position1 >= 0) {
            position2 = i;
            break;
        }
    }

    if (position2 >= 0) {
        offer.product_details[position2][productDetailId] = productDetailValue;
    } else {
        offer.product_details.push({ [productDetailId]: productDetailValue });
    }
};

router.put(
    "/offer/update",
    isAuthenticated,
    areParametersOK,
    async (req: any, res: Response) => {
        try {
            if (!req.fields._id) {
                res.status(400).json({
                    error: { message: "Offer id is mandatory." },
                });
                return;
            }
            let offer: typeof Offer = await Offer.findById(
                req.fields._id
            ).populate("owner");

            if (!offer) {
                res.status(400).json({ error: { message: "Offer not found" } });
                return;
            }
            if (req.user._id.toString() !== offer.owner._id.toString()) {
                res.status(401).json({
                    error: { message: "Unauthorized133" },
                });
                return;
            }

            if (req.fields.title) {
                offer.product_name = req.fields.title;
            }
            if (req.fields.description) {
                offer.product_description = req.fields.description;
            }
            if (req.fields.price) {
                offer.product_price = req.fields.price;
            }

            updateProductDetail(offer, "MARQUE", req.fields.brand);
            updateProductDetail(offer, "TAILLE", req.fields.size);
            updateProductDetail(offer, "ÉTAT", req.fields.condition);
            updateProductDetail(offer, "COULEUR", req.fields.color);
            updateProductDetail(offer, "EMPLACEMENT", req.fields.city);

            // Notifie Mongoose que l'on a modifié le tableau product_details
            offer.markModified("product_details");

            if (req.files && req.files.picture && req.files.picture.path) {
                const productImageInformations = await cloudinary.uploader.upload(
                    req.files.picture.path,
                    { folder: "/vinted/offers/" + offer._id }
                );
                offer.product_image = productImageInformations;
            }

            await offer.save();
            res.json(offer);
        } catch (error) {
            res.status(400).json({ error: { message: error.message } });
        }
    }
);

router.delete(
    "/offer/delete",
    isAuthenticated,
    async (req: Request, res: Response) => {
        try {
            const offer = await Offer.findByIdAndDelete(req.query.id);

            if (offer) {
                res.status(200).json("Offer removed");
            } else {
                res.status(200).json("Offer not found");
            }
        } catch (error) {
            res.status(400).json({ error: { message: error.message } });
        }
    }
);

router.get("/offers", async (req: Request, res: Response) => {
    try {
        const debug = false;

        // Destructuring
        let { priceMin, priceMax, sort, page, limit } = req.query;

        let pageAsNumber: number;
        let limitAsNumber: number;

        const title: string = req.query.title as string;

        if (!Number(page)) {
            pageAsNumber = 1;
        } else {
            pageAsNumber = Number(page);

            if (pageAsNumber < 1) {
                pageAsNumber = 1;
            }
        }
        if (!Number(limit)) {
            limitAsNumber = 10;
        } else {
            limitAsNumber = Number(limit);
            if (limitAsNumber < 1) {
                limitAsNumber = 10;
            }
        }

        interface iOfferFilters {
            product_name?: RegExp;
            product_price?: {
                $gte?: number;
                $lte?: number;
            };
        }

        let filters: iOfferFilters = {};
        if (title) {
            filters.product_name = new RegExp(title, "i");
        }

        if (Number(priceMin) || Number(priceMax)) {
            filters.product_price = {};
            if (Number(priceMin)) {
                filters.product_price.$gte = Number(priceMin);
            }
            if (Number(priceMax)) {
                filters.product_price.$lte = Number(priceMax);
            }
        }

        interface iOfferSortBy {
            product_price?: string;
        }

        let sortBy: iOfferSortBy = {};

        if (sort) {
            if (sort === "price-asc") {
                sortBy.product_price = "asc";
            } else if (sort === "price-desc") {
                sortBy.product_price = "desc";
            }
        }

        const offersCount = await Offer.countDocuments(filters);

        const offers = await Offer.find(filters)
            .limit(limitAsNumber)
            .skip((pageAsNumber - 1) * limitAsNumber)
            .sort(sortBy)
            .populate(
                debug ? "" : "owner",
                "account.username account.phone account.avatar.secure_url account.avatar.original_filename"
            )
            .select(
                debug
                    ? "product_name product_price"
                    : "product_details product_image.secure_url product_name product_description product_price"
            );
        const result = { count: offersCount, offers: offers };

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
});

router.get("/offer/:id", async (req: Request, res: Response) => {
    try {
        if (req.params.id) {
            let offer = await Offer.findById(req.params.id).populate(
                "owner",
                "account"
            );
            res.status(200).json(offer);
        } else {
            res.status(400).json({
                error: { message: "Product id value is mandatory." }, //Inutile car on passe à la place dans le app.all
            });
        }
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
});

module.exports = router;
