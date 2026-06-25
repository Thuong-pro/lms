import { Schema, model } from "mongoose";

/**
 * @forumVoteSchema - Mongoose schema for Forum Voting.
 * Tracks upvotes/downvotes for threads and replies.
 */

const forumVoteSchema = new Schema({
    threadId: {
        type: Schema.Types.ObjectId,
        ref: 'ForumThread',
        default: null
    },
    replyId: {
        type: Schema.Types.ObjectId,
        ref: 'ForumReply',
        default: null
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID is required"]
    },
    type: {
        type: String,
        enum: ['upvote', 'downvote'],
        required: [true, "Vote type is required"]
    }
}, {
    timestamps: true
});

// Ensure either threadId or replyId is present
forumVoteSchema.pre('save', function(next) {
    if (!this.threadId && !this.replyId) {
        throw new Error('Either threadId or replyId is required');
    }
    next();
});

const ForumVote = model('ForumVote', forumVoteSchema);

export default ForumVote;
