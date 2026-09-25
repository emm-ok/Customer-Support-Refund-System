import dotenv from 'dotenv';
dotenv.config();

export const env = {
    PORT: process.env.PORT! || 5000,
    NODE_ENV: process.env.NODE_ENV! || 'development',

    DATABASE_URL: process.env.DATABASE_URL!,

    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",

    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
    GEMINI_MODEL: process.env.GEMINI_MODEL!,
}

Object.entries(env).forEach(([key, value]) => {
    if (!value) {
        console.log("Missing environment variable", key)
    }
})

