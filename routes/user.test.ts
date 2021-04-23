import { send } from "node:process";
import request from "supertest";
import { app } from "../server";
const express = require("express");
const User = require("../models/User");

const mongooseTests = require("mongoose");

beforeAll((done) => {
    const bddUri = process.env.MONGODB_TESTS_URI;

    console.log(
        `-------------------------- Début des tests de user.ts sur la base ${bddUri} --------------------------------`
    );

    //Connexion à la base de données
    mongooseTests.connect(
        bddUri,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true, //Ajout pour éviter un warning car on a un modèle avec unique: true,
        },
        () => done()
    );
});

test("POST /user/login", async () => {
    await request(app)
        .post("/user/login")
        .send({
            email: "j3@s.fr",
            password: "j",
        })
        .expect(200)
        .then((response) => {
            //console.log("response.body : ", response.body);
            expect(response.body._id).toBe("6081a6fa764c2a06a5ba5ce4");
            expect(response.body.token).toBe(
                "lOU8e6eG0tWNMbW9E4skxlNMafepybFO1AMFZdujMFoWlREpzuqVGEZX4lwUj6vA"
            );
            expect(response.body.account).toStrictEqual({
                username: "j3",
                phone: "0302020202",
            });
        });
});

test("POST /user/signup", async () => {
    const oldUser = await User.findOne({ email: "j4@s.fr" });
    console.log(oldUser);
    if (oldUser?._id) {
        await User.findByIdAndDelete(oldUser._id);
    }

    let newUserId = "unknown";

    await request(app)
        .post("/user/signup")
        .send({
            email: "j4@s.fr",
            password: "j",
            phone: "0404040404",
            username: "j4",
        })
        //.expect(200)
        .then((response) => {
            console.log("response.body : ", response.body);
            expect(response.body._id).not.toBeNull();
            expect(response.body.token).not.toBeNull();
            expect(response.body.account).toStrictEqual({
                username: "j4",
                phone: "0404040404",
            });

            newUserId = response.body._id;
        })
        .then(async () => {
            expect(await User.findById(newUserId)).toBeTruthy();
        });
});

afterAll((done) => {
    //On se déconnecte de la base de données
    mongooseTests.connection.close(() => done());
});
