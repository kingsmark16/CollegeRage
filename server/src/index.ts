import env from "./config/env";
import { createServer } from "./server";

const server = createServer();

server.listen(env.PORT, '0.0.0.0',() => {
    console.log(`Servr is running on port ${env.PORT}`);
})