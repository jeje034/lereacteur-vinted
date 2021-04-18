import request from "supertest";
import { app } from "../sever";
const express = require("express");

const mongooseTest = require("mongoose");

beforeAll((done) => {
    mongooseTest.connect(
        process.env.MONGODB_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true, //Ajout pour éviter un warning car on a un modèle avec unique: true,
        },
        () => done()
    );
});

afterAll((done) => {
    mongooseTest.connection.db.dropDatabase(() => {
        mongooseTest.connection.close(() => done());
    });
});

test("GET /offer/:id", async () => {
    //const post = await Post.create({ title: "Post 1", content: "Lorem ipsum" });

    await request(app)
        .get("/offer/" + "60292e0369c3fa0015c8d795") //post.id")
        .expect(200)
        .then((response) => {
            expect(response.body._id).toBe("60292e0369c3fa0015c8d795"); //post.id);
            expect(response.body.product_name).toBe("Tongs Roxy bleues");
        });
});

test("GET /offers", async () => {
    await request(app)
        .get("/offers")
        .expect(200)
        .then((response) => {
            expect(response.body.offers[0]._id).toBe(
                "600b1eabde4f83001522fbf7"
            );
            expect(response.body.offers[0].product_name).toBe("Air Max 90");
            expect(response.body.offers[1]._id).toBe(
                "60292e0369c3fa0015c8d795"
            );
            expect(response.body.offers[1].product_name).toBe(
                "Tongs Roxy bleues"
            );
        });
});
