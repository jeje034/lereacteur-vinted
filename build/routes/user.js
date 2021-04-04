"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var router = express.Router();
var SHA256 = require("crypto-js/sha256");
var encBase64 = require("crypto-js/enc-base64");
var uid2 = require("uid2");
var User = require("../models/User");
var cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: "dkr7mhnnq",
    api_key: "295848561264668",
    api_secret: "WmjYOjpUCZc9mP63hecn6j9N4zA",
});
router.post("/user/signup", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var otherUser, password, salt, hash, token, newUser, avatarInformations, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                if (!req.fields.username || !req.fields.email || !req.fields.password) {
                    res.status(400).json({
                        error: { message: "Missing parameters." },
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, User.findOne({ email: req.fields.email })];
            case 1:
                otherUser = _a.sent();
                if (otherUser) {
                    res.status(400).json({
                        error: { message: "this email has already an account." },
                    });
                    return [2 /*return*/];
                }
                password = req.fields.password;
                salt = uid2(64);
                hash = SHA256(password + salt).toString(encBase64);
                token = uid2(64);
                newUser = new User({
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
                if (!(req.files && req.files.picture && req.files.picture.path)) return [3 /*break*/, 3];
                return [4 /*yield*/, cloudinary.uploader.upload(req.files.picture.path, { folder: "/vinted/avatars/" + newUser._id })];
            case 2:
                avatarInformations = _a.sent();
                newUser.account.avatar = avatarInformations;
                _a.label = 3;
            case 3: return [4 /*yield*/, newUser.save()];
            case 4:
                _a.sent();
                result = {
                    _id: newUser._id,
                    token: newUser.token,
                    account: {
                        username: newUser.account.username,
                        phone: newUser.account.phone,
                    },
                };
                res.status(200).json(result);
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                res.status(400).json({ error: error_1.message });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
router.post("/user/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, User.findOne({ email: req.fields.email })];
            case 1:
                user = _a.sent();
                if (user &&
                    SHA256(req.fields.password + user.salt).toString(encBase64) ===
                        user.hash) {
                    res.status(200).json({
                        _id: user._id,
                        token: user.token,
                        account: {
                            username: user.account.username,
                            phone: user.account.phone,
                        },
                    });
                }
                else {
                    res.status(401).json({
                        error: { message: "Unauthorized" },
                    });
                }
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                res.status(400).json({ error: { message: error_2.message } });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
