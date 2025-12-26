import mongoose from "mongoose";

interface IVideo {
    title: string;
    description?: string;
    url: string;
    uploadedBy: mongoose.Types.ObjectId;
    likes: number;
    comments: mongoose.Types.ObjectId[];
    uploadedAt: Date;
}

const videoSchema = new mongoose.Schema<IVideo>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    uploadedAt: {
        type: Date,
        default: Date.now
    }
})

export const VideoModel = mongoose.model<IVideo>("Video", videoSchema);