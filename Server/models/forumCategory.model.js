import { Schema, model } from "mongoose";

/**
 * @forumCategorySchema - Mongoose schema for Forum Categories.
 * Defines discussion forum categories/channels.
 */

const forumCategorySchema = new Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        minLength: [3, "Name must be at least 3 characters"],
        maxLength: [50, "Name should be less than 50 characters"],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        minLength: [10, "Description must be at least 10 characters"],
        maxLength: [300, "Description should be less than 300 characters"],
        trim: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        default: null
    },
    icon: {
        type: String,
        default: '💬'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    threadCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const ForumCategory = model('ForumCategory', forumCategorySchema);

export default ForumCategory;
