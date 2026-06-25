import { Schema, model } from "mongoose";

/**
 * @forumThreadSchema - Mongoose schema for Forum Threads (Posts).
 * Defines discussion topics/posts with metadata.
 */

const forumThreadSchema = new Schema({
    title: {
        type: String,
        required: [true, "Thread title is required"],
        minLength: [5, "Title must be at least 5 characters"],
        maxLength: [200, "Title should be less than 200 characters"],
        trim: true
    },
    content: {
        type: String,
        required: [true, "Content is required"],
        minLength: [5, "Content must be at least 5 characters"],
        maxLength: [5000, "Content should be less than 5000 characters"],
        trim: true
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'ForumCategory',
        required: [true, "Category ID is required"]
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        default: null
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Author ID is required"]
    },
    views: {
        type: Number,
        default: 0
    },
    tags: [
        {
            type: String,
            maxLength: 30
        }
    ],
    isPinned: {
        type: Boolean,
        default: false
    },
    isClosed: {
        type: Boolean,
        default: false
    },
    replyCount: {
        type: Number,
        default: 0
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
    },
    upvotes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    downvotes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true
});

const ForumThread = model('ForumThread', forumThreadSchema);

export default ForumThread;
