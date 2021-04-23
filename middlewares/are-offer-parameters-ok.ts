import { NextFunction, Response } from "express";

interface iOfferParametersToControl {
    fields: {
        title: string;
        description: string;
        price: number;
    };
}

const areOfferParametersOK = (
    req: iOfferParametersToControl,
    res: Response,
    next: NextFunction
) => {
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
        let price = req.fields.price;

        if (isNaN(price)) {
            res.status(400).json({
                error: {
                    message: "Le prix n'est pas un nombre correct.",
                },
            });
            return;
        }

        if (price < 0) {
            res.status(400).json({
                error: {
                    message: "Un prix ne peut pas être négatif.",
                },
            });
            return;
        }

        if (price > 100000) {
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

module.exports = areOfferParametersOK;
