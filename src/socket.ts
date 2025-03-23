import { Server as Socket } from "socket.io";

import { server } from "./server";

const io = new Socket(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", () => {
  console.log("Connected!");
});
