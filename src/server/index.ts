console.log(">>> server/index.ts LOADED");

import 'dotenv/config';
import { createApp } from '../app/index.js';
import { waitForDB } from '../infra/database.js';
import { config } from '../config/env.js';

export async function startServer() {
    await waitForDB();

    const app = createApp();

    app.listen(config.port, () => {
        console.log(`🟢 🟢 🟢 Server running on http://localhost:${config.port} 🟢 🟢 🟢`);
    });
}
