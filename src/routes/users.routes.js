import { Router } from "express";
import { login, register,getAllRooms } from "../controllers/user.controller.js";

const userRouter=Router();

userRouter.route('/login').post(login)
userRouter.route('/register').post(register) 
userRouter.route('/get_all_activity').post(getAllRooms)

export { userRouter };