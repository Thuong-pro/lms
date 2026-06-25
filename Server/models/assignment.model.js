import { model, Schema } from 'mongoose';

const assignmentSchema = new Schema({
    courseId: { 
        type: String, 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    // Chứa danh sách các học sinh nộp bài
    submissions: [{
        studentId: { type: String, required: true },
        studentName: { type: String, required: true },
        content: { type: String, required: true }, // Học sinh nộp link Google Drive hoặc Github
        score: { type: Number, default: null }, // Điểm số (Giáo viên chấm)
        feedback: { type: String, default: '' }, // Nhận xét
        submittedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

const Assignment = model('Assignment', assignmentSchema);
export default Assignment;