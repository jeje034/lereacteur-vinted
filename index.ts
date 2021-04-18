//index.ts a été découpé en index.ts et server.ts afin de pouvoir exécuter les tests avec Jest et Supertest

import { app } from "./sever";

app.listen(process.env.PORT, () => {
    console.log("Server started.");
});
