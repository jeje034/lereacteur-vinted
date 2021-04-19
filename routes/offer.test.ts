import request from "supertest";
import { app } from "../server";
const express = require("express");

const mongooseTests = require("mongoose");

beforeAll((done) => {
    const bddUri = process.env.MONGODB_TESTS_URI;

    console.log(
        `-------------------------- Début des tests offer sur la base ${bddUri} --------------------------------`
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
        .get("/offer/" + "607d71cc3549ca43b00c127f") //post.id")
        .expect(200)
        .then((response) => {
            expect(response.body._id).toBe("607d71cc3549ca43b00c127f"); //post.id);
            expect(response.body.product_name).toBe("Tongs Roxy bleues");
        });
});

test("GET /offers", async () => {
    await request(app)
        .get("/offers")
        .expect(200)
        .then((response) => {
            expect(response.body.offers[0]._id).toBe(
                "607d71cc3549ca43b00c127f"
            );
            expect(response.body.offers[0].product_name).toBe(
                "Tongs Roxy bleues"
            );
            expect(response.body.offers[1]._id).toBe(
                "607d71d63549ca43b00c1280"
            );
            expect(response.body.offers[1].product_name).toBe("Jupe évasée");
        });
});
