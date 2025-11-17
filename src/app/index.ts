console.log(">>> app/index.ts LOADED");


import express, { type Application } from 'express';
import cors from 'cors';
import { router } from './routes/index.js';

export function createApp(): Application {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(router);

    return app;
}
