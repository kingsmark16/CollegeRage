import mongoose from "mongoose";

interface IImage {
    title: string;
    description?: string;
    url: string;
    uploadedBy: mongoose.Types.ObjectId;
    likes: number;
    comments: mongoose.Types.ObjectId[];
    uploadedAt: Date;
}

const imageSchema = new mongoose.Schema<IImage>({
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
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

export const ImageModel = mongoose.model<IImage>("Image", imageSchema);

