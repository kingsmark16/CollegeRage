import mongoose from "mongoose";

interface IComment {
    content: string;
    postedBy: mongoose.Types.ObjectId;
    postedAt: Date;
    onImage?: mongoose.Types.ObjectId;
    onVideo?: mongoose.Types.ObjectId;
}

const commentSchema = new mongoose.Schema<IComment>({
    content: {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    postedAt: {
        type: Date,
        default: Date.now
    },
    onImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
        required: false
    },
    onVideo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: false
    }
})

export const CommentModel = mongoose.model<IComment>("Comment", commentSchema);