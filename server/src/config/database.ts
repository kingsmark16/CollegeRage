import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if(!mongoURI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        await mongoose.connect(mongoURI);

        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            process.exit(0);
        });

        console.log("MongoDB connected successfully");

    } catch (error) {
        throw new Error(`Database connection error: ${error}`);
    }
}

export const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        console.log("MongoDB disconnected successfully");
    } catch (error) {
        throw new Error(`Database disconnection error: ${error}`);
    }
}