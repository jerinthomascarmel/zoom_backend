import mongoose from "mongoose";
import express from "express";
import { createServer } from "node:http";
import { connectToSocket } from "./controllers/socketManager2.js";
import cors from "cors";
import { userRouter } from "./routes/users.routes.js";
import { meetingRouter } from "./routes/meetings.routes.js";



const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8080);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/users', userRouter);
app.use('/meeting', meetingRouter);
app.get('/', (req, res) => {
  res.send('this is root ');
})

const start = async () => {
  const connectionDb = await mongoose.connect(
    "mongodb+srv://jerinthomascarmel:W4jggQMg94QeVhIL@cluster0.zjpuung.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  );
  console.log(`DB connected ${connectionDb.connection.host}`);

  server.listen(app.get("port"), () => {
    console.log("listening on port  8080");
  });
};

start();
