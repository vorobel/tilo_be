import {Router} from "express";
import {register, login, googleAuth, facebookAuth, refresh, logout} from "../../modules/auth/auth.controller.js";

export const authRouter: Router = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.post('/google', googleAuth);
authRouter.post('/facebook', facebookAuth);
