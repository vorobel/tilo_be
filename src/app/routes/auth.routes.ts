import {Router} from "express";
import {register, login, refresh, logout} from "../../modules/auth/auth.controller.js";

export const authRouter: Router = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);