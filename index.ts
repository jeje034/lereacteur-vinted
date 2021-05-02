//index.ts a été découpé en index.ts et server.ts afin de pouvoir exécuter les tests avec Jest et Supertest

import { app } from "./server";
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true, //Ajout pour éviter un warning car on a un modèle avec unique: true,
});

app.listen(process.env.PORT, () => {
    console.log(`Server started (port ${process.env.PORT}).`);
});
