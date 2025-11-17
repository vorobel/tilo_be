import { Router, type Router as RouterType } from 'express';
import {authRouter} from "./auth.routes.js";
import { healthRouter } from './health.js';

export const router: RouterType = Router();

router.use('auth', authRouter);
router.use('/health', healthRouter);
