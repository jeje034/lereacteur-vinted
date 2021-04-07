export {};
const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/User");

const cloudinary = require("cloudinary").v2;

import { Response } from "express";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface iSignUpVinted {
    fields: {
        email: string;
        password: string;
        username: string;
        phone: string;
    };
    files: { picture: any };
}

router.post("/user/signup", async (req: iSignUpVinted, res: Response) => {
    try {
        if (!req.fields.username || !req.fields.email || !req.fields.password) {
            res.status(400).json({
                error: { message: "Missing parameters." },
            });
            return;
        }

        const otherUser = await User.findOne({ email: req.fields.email });
        if (otherUser) {
            res.status(400).json({
                error: { message: "this email has already an account." },
            });
            return;
        }

        let password = req.fields.password;
        const salt = uid2(64);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(64);

        let newUser = new User({
            email: req.fields.email ? req.fields.email : "",
            account: {
                username: req.fields.username,
                phone: req.fields.phone ? req.fields.phone : "",
                avatar: null,
            },
            token: token,
            hash: hash,
            salt: salt,
        });

        if (req.files && req.files.picture && req.files.picture.path) {
            const avatarInformations = await cloudinary.uploader.upload(
                req.files.picture.path,
                { folder: "/vinted/avatars/" + newUser._id }
            );
            newUser.account.avatar = avatarInformations;
        }

        await newUser.save();
        const result = {
            _id: newUser._id,
            token: newUser.token,
            account: {
                username: newUser.account.username,
                phone: newUser.account.phone,
            },
        };
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

interface iLoginVinted {
    fields: { email: string; password: string };
}

router.post("/user/login", async (req: iLoginVinted, res: Response) => {
    try {
        const user = await User.findOne({ email: req.fields.email });
        if (
            user &&
            SHA256(req.fields.password + user.salt).toString(encBase64) ===
                user.hash
        ) {
            res.status(200).json({
                _id: user._id,
                token: user.token,
                account: {
                    username: user.account.username,
                    phone: user.account.phone,
                },
            });
        } else {
            res.status(401).json({
                error: { message: "Unauthorized" },
            });
        }
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
});

module.exports = router;
