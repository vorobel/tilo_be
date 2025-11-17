import 'dotenv/config';

export const config = {
    port: process.env.PORT || 8000,
    env: process.env.NODE_ENV || 'development',
}