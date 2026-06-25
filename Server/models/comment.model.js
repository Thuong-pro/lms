import { model, Schema } from 'mongoose';

const commentSchema = new Schema({
    courseId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    content: { type: String, required: true }
}, { timestamps: true });

export default model('Comment', commentSchema);