import request from "supertest";
import { app } from "../server";
const express = require("express");

const mongooseTests = require("mongoose");

beforeAll((done) => {
    const bddUri = process.env.MONGODB_TESTS_URI;

    console.log(
        `-------------------------- Début des tests de offer.ts sur la base ${bddUri} --------------------------------`
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

afterAll((done) => {
    //On se déconnecte de la base de données
    mongooseTests.connection.close(() => done());

    //Exemple de suppression de base
    // mongooseTests.connection.db.dropDatabase(() => {
    //     mongooseTests.connection.close(() => done());
    // });
});

test("GET /offer/:id", async () => {
    //const post = await Post.create({ title: "Post 1", content: "Lorem ipsum" });

    await request(app)
        .get("/offer/" + "6081a759764c2a06a5ba5ce5") //post.id")
        .expect(200)
        .then((response) => {
            expect(response.body._id).toBe("6081a759764c2a06a5ba5ce5"); //post.id);
            expect(response.body.product_name).toBe("Tongs Roxy bleues");
        });
});

test("GET /offers", async () => {
    await request(app)
        .get("/offers")
        .expect(200)
        .then((response) => {
            expect(response.body.offers[0]._id).toBe(
                "6081a759764c2a06a5ba5ce5"
            );
            expect(response.body.offers[0].product_name).toBe(
                "Tongs Roxy bleues"
            );
            expect(response.body.offers[1]._id).toBe(
                "6081a78b764c2a06a5ba5ce6"
            );
            expect(response.body.offers[1].product_name).toBe("Jupe évasée");
        });
});

test("PUT /offer/update without authorization", async () => {
    await request(app)
        .put("/offer/update")
        .send({ _id: "6081a759764c2a06a5ba5ce5", price: 15 })
        .expect(401)
        .then((response) => {
            //console.log("response,body : ", response.body);
            expect(response.body.error.message).toBe("Unauthorized");
        });
});

test("PUT /offer/update with authorization, price at 6 €", async () => {
    await request(app)
        .put("/offer/update")
        .auth(
            "lOU8e6eG0tWNMbW9E4skxlNMafepybFO1AMFZdujMFoWlREpzuqVGEZX4lwUj6vA",
            { type: "bearer" }
        )
        .send({ _id: "6081a759764c2a06a5ba5ce5", price: 6 })
        .expect(200)
        .then((response) => {
            //console.log("response : ", response);
            console.log("response,body : ", response.body);
            expect(response.body._id).toBe("6081a759764c2a06a5ba5ce5");
            expect(response.body.product_name).toBe("Tongs Roxy bleues");
            expect(response.body.product_price).toBe(6);
        });
});

test("PUT /offer/update with authorization, price at 5 €", async () => {
    await request(app)
        .put("/offer/update")
        .auth(
            "lOU8e6eG0tWNMbW9E4skxlNMafepybFO1AMFZdujMFoWlREpzuqVGEZX4lwUj6vA",
            { type: "bearer" }
        )
        .send({ _id: "6081a759764c2a06a5ba5ce5", price: 5 })
        .expect(200)
        .then((response) => {
            //console.log("response : ", response);
            console.log("response,body : ", response.body);
            expect(response.body._id).toBe("6081a759764c2a06a5ba5ce5");
            expect(response.body.product_name).toBe("Tongs Roxy bleues");
            expect(response.body.product_price).toBe(5);
        });
});

test("POST /offer/publish", async () => {
    await request(app)
        .post("/offer/publish")
        .auth(
            "lOU8e6eG0tWNMbW9E4skxlNMafepybFO1AMFZdujMFoWlREpzuqVGEZX4lwUj6vA",
            { type: "bearer" }
        )
        .send({
            title: "created by supertest",
            description: "created by supertest with bearer token",
            price: 111,
            size: "M",
            brand: "TestBrand",
            condition: "Nickel",
            city: "Montpellier",
            color: "Bleu",
        })
        .expect(200)
        .then((response) => {
            //console.log("response : ", response);
            console.log("response,body : ", response.body);
            expect(response.body.product_name).toBe("created by supertest");
            expect(response.body.product_description).toBe(
                "created by supertest with bearer token"
            );
            expect(response.body.product_price).toBe(111);
            expect(response.body.product_details).toContainEqual({
                MARQUE: "TestBrand",
            });
            expect(response.body.product_details).toContainEqual({
                TAILLE: "M",
            });
        });
});

//auth('my_token', { type: 'bearer' }) de https://visionmedia.github.io/superagent/#head-requests
