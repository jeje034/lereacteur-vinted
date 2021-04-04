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
var Router = require("express").Router;
var express = require("express");
var route = require("./user").route;
var router = express.Router();
var User = require("../models/User");
var Offer = require("../models/Offer");
var cloudinary = require("cloudinary").v2;
var isAuthenticated = require("../middlewares/is-authenticated");
var areParametersOK = function (req, res, next) {
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
        var price = Number.parseInt(req.fields.price);
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
router.post("/offer/publish", isAuthenticated, areParametersOK, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, description, price, size, brand, condition, city, color, newOffer, productImageInformations, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.fields, title = _a.title, description = _a.description, price = _a.price, size = _a.size, brand = _a.brand, condition = _a.condition, city = _a.city, color = _a.color;
                newOffer = new Offer({
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
                if (!req.files.picture) return [3 /*break*/, 2];
                return [4 /*yield*/, cloudinary.uploader.upload(req.files.picture.path, { folder: "/vinted/offers/" + newOffer._id })];
            case 1:
                productImageInformations = _b.sent();
                newOffer.product_image = productImageInformations;
                _b.label = 2;
            case 2: 
            //msgjs21
            return [4 /*yield*/, newOffer.save()];
            case 3:
                //msgjs21
                _b.sent();
                res.status(200).json(newOffer);
                return [3 /*break*/, 5];
            case 4:
                error_1 = _b.sent();
                res.status(400).json({ error: { message: error_1.message } });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
var updateProductDetail = function (offer, productDetailId, productDetailValue) {
    if (!productDetailValue) {
        return;
    }
    var position1;
    var position2 = -1;
    for (var i = 0; i < offer.product_details.length; i++) {
        position1 = Object.keys(offer.product_details[i]).indexOf(productDetailId);
        if (position1 >= 0) {
            position2 = i;
            break;
        }
    }
    if (position2 >= 0) {
        offer.product_details[position2][productDetailId] = productDetailValue;
    }
    else {
        //msgjs21 tester : ce ne devait pas marcher avant typescipt
        offer.product_details.push({ productDetailId: productDetailValue });
    }
};
router.put("/offer/update", isAuthenticated, areParametersOK, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var offer, productImageInformations, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                if (!req.fields._id) {
                    res.status(400).json({
                        error: { message: "Offer id is mandatory." },
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, Offer.findById(req.fields._id).populate("owner")];
            case 1:
                offer = _a.sent();
                if (!offer) {
                    res.status(400).json({ error: { message: "Offer not found" } });
                    return [2 /*return*/];
                }
                if (req.user._id.toString() !== offer.owner._id.toString()) {
                    res.status(401).json({
                        error: { message: "Unauthorized133" },
                    });
                    return [2 /*return*/];
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
                if (!(req.files && req.files.picture && req.files.picture.path)) return [3 /*break*/, 3];
                return [4 /*yield*/, cloudinary.uploader.upload(req.files.picture.path, { folder: "/vinted/offers/" + offer._id })];
            case 2:
                productImageInformations = _a.sent();
                offer.product_image = productImageInformations;
                _a.label = 3;
            case 3: return [4 /*yield*/, offer.save()];
            case 4:
                _a.sent();
                res.json(offer);
                return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                res.status(400).json({ error: { message: error_2.message } });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
router.delete("/offer/delete", isAuthenticated, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var offer, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Offer.findByIdAndDelete(req.query.id)];
            case 1:
                offer = _a.sent();
                if (offer) {
                    res.status(200).json("Offer removed");
                }
                else {
                    res.status(200).json("Offer not found");
                }
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                res.status(400).json({ error: { message: error_3.message } });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/offers", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var debug, _a, title, priceMin, priceMax, sort, page, limit, filters, sortBy, offersCount, offers, result, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                debug = false;
                _a = req.query, title = _a.title, priceMin = _a.priceMin, priceMax = _a.priceMax, sort = _a.sort, page = _a.page, limit = _a.limit;
                if (!Number(page) || page < 1) {
                    page = 1;
                }
                if (!Number(limit) || limit < 1) {
                    limit = 10;
                }
                limit = Number(limit);
                filters = {};
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
                sortBy = {};
                if (sort) {
                    if (sort === "price-asc") {
                        sortBy.product_price = "asc";
                    }
                    else if (sort === "price-desc") {
                        sortBy.product_price = "desc";
                    }
                }
                return [4 /*yield*/, Offer.countDocuments(filters)];
            case 1:
                offersCount = _b.sent();
                return [4 /*yield*/, Offer.find(filters)
                        .limit(limit)
                        .skip((page - 1) * limit)
                        .sort(sortBy)
                        .populate(debug ? "" : "owner", "account.username account.phone account.avatar.secure_url account.avatar.original_filename")
                        .select(debug
                        ? "product_name product_price"
                        : "product_details product_image.secure_url product_name product_description product_price")];
            case 2:
                offers = _b.sent();
                result = { count: offersCount, offers: offers };
                res.status(200).json(result);
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                res.status(400).json({ error: { message: error_4.message } });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.get("/offer/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var offer, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                if (!req.params.id) return [3 /*break*/, 2];
                return [4 /*yield*/, Offer.findById(req.params.id).populate("owner", "account")];
            case 1:
                offer = _a.sent();
                res.status(200).json(offer);
                return [3 /*break*/, 3];
            case 2:
                res.status(400).json({
                    error: { message: "Product id value is mandatory." }, //Inutile car on passe à la place dans le app.all
                });
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                error_5 = _a.sent();
                res.status(400).json({ error: { message: error_5.message } });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
