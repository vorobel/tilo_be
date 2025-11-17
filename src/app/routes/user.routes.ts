import {Router} from "express";
import {authGuard} from "../../middleware/authGuard.js";
import {requireAnyRole, requireRole} from "../../middleware/requireRole.js";
import {UserRole} from "@prisma/client";
import {getMe} from "../../modules/user/user.controller.js";

export const userRouter: Router = Router();

userRouter.get('/me', authGuard, getMe);

userRouter.get(
    '/admin-test',
    authGuard,
    requireRole(UserRole.ADMIN),
    (req, res) => {
        res.json({ message: "Only admin can see this" });
    }
);

userRouter.get(
    '/multi-role-example',
    authGuard,
    requireAnyRole([UserRole.ADMIN, UserRole.USER]),
    (req,res) => {
        res.json({ message: "Users and admin can see that" });
    }
)
