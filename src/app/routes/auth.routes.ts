import {Router} from "express";
import {AuthController} from "../../modules/auth/auth.controller.js";

export const authRouter: Router = Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);