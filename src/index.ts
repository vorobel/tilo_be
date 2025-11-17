console.log(">>> index.ts loaded");
import 'dotenv/config';

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

import { startServer } from './server/index.js';

startServer();
