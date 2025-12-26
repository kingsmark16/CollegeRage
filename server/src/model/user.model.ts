import mongoose from "mongoose";

interface IUser {
    fullName: string;
    email: string;
    profilePicture?: string;
    clerkId: string;
    createdAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    profilePicture: {
        type: String,
        default: ""
    },
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export const UserModel = mongoose.model<IUser>("User", userSchema);