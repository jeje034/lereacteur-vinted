import { send } from "node:process";
import request from "supertest";
import { app } from "../server";
const express = require("express");

beforeAll((done) => {
    console.log(
        `-------------------------- Début des tests de payment.ts --------------------------------`
    );
    done();
});

test("POST /payment without stripeToken", async () => {
    await request(app)
        .post("/payment")
        .send({
            productName: "fakeProduct",
            amount: 111,
        })
        .expect(400)
        .then((response) => {
            //console.log("response.body : ", response.body);
            expect(response.body.error).toStrictEqual({
                message: "Missing parameters.",
            });
        });
});
