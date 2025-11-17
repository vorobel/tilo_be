import {Router} from "express";
import {getMe} from "../../modules/user/user.controller.js";
import {authGuard} from "../../middleware/authGuard.js";
import {requireRole} from "../../middleware/requireRole.js";
import {UserRole} from "@prisma/client";

export const userRouter: Router = Router();

userRouter.get(
    '/admin-test',
    authGuard,
    requireRole(UserRole.ADMIN),
    (req, res) => {
        res.json({ message: "Only admin can see this" });
    }
);