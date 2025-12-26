import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import { connectDB } from './config/database';
import dropboxAuthRoutes from './routes/dropboxAuth.routes';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngest, functions } from './config/inngest';

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(cors({
    credentials: true,
}));
app.use(clerkMiddleware());

app.use("/api/inngest", serve({client: inngest, functions}))
app.use("/api/dropbox-auth",dropboxAuthRoutes);

app.get("/", (req, res) => {
        res.status(200).json({message: "Hello"});
});

const startServer = async () => {
    try {
        await connectDB();

        if(process.env.NODE_ENV !== "production"){
            app.listen(PORT, () => {
                console.log(`Server running on http://localhost:${PORT}`);
            })
        }
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
startServer();

export default app;