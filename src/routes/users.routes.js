import { Router } from "express";
import { login, register } from "../controllers/user.controller.js";

const userRouter=Router();

userRouter.route('/login').post(login)
userRouter.route('/register').post(register) 
userRouter.route('/add_to_activity')
userRouter.route('/get_all_activity')

export { userRouter };