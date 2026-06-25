import { Schema, model } from "mongoose";

/**
 * @forumReplySchema - Mongoose schema for Forum Replies/Comments.
 * Supports nested replies (reply to reply).
 */

const forumReplySchema = new Schema({
    threadId: {
        type: Schema.Types.ObjectId,
        ref: 'ForumThread',
        required: [true, "Thread ID is required"]
    },
    content: {
        type: String,
        required: [true, "Reply content is required"],
        minLength: [2, "Content must be at least 2 characters"],
        maxLength: [3000, "Content should be less than 3000 characters"],
        trim: true
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Author ID is required"]
    },
    parentReplyId: {
        type: Schema.Types.ObjectId,
        ref: 'ForumReply',
        default: null
    },
    isAcceptedAnswer: {
        type: Boolean,
        default: false
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    dislikes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    replyCount: {
        type: Number,
        default: 0
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    }
}, {
    timestamps: true
});

const ForumReply = model('ForumReply', forumReplySchema);

export default ForumReply;
