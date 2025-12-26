import mongoose from "mongoose";

interface IDropboxToken {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const dropboxTokenSchema = new mongoose.Schema<IDropboxToken>({
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
    },
    expiresAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export const DropboxTokenModel = mongoose.model<IDropboxToken>("DropboxToken", dropboxTokenSchema);