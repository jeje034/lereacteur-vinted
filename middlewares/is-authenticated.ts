export {};
import { NextFunction, Response } from "express";

const User = require("../models/User");

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        if (req.headers.authorization) {
            const user = await User.findOne({
                token: req.headers.authorization.replace("Bearer ", ""),
            }).select("account email token");
            if (user) {
                req.user = user;
                next();
            } else {
                res.status(401).json({
                    error: { message: "Unauthorized" },
                });
            }
        } else {
            res.status(401).json({
                error: { message: "Unauthorized" },
            });
        }
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
};

module.exports = isAuthenticated;
