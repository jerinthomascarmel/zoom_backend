import { Router } from "express";
import { joinRoom, createRoom, getAllMessages } from "../controllers/meeting.controller.js";
const meetingRouter = Router();

meetingRouter.route('/create-room').post(createRoom)
meetingRouter.route('/join-room').post(joinRoom)
meetingRouter.route('/get-allmessages').post(getAllMessages)


export { meetingRouter };
