import { Schema, model } from "mongoose";

/**
 * @quizSchema - Mongoose schema for Quiz.
 * Defines structure for quizzes/exams including questions, scoring, and metadata.
 */

const quizSchema = new Schema({
    title: {
        type: String,
        required: [true, "Quiz title is required"],
        minLength: [5, "Title must be at least 5 characters"],
        maxLength: [100, "Title should be less than 100 characters"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        minLength: [10, "Description must be at least 10 characters"],
        maxLength: [500, "Description should be less than 500 characters"],
        trim: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, "Course ID is required"]
    },
    questions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Question'
        }
    ],
    passingScore: {
        type: Number,
        required: [true, "Passing score is required"],
        min: 0,
        max: 100,
        default: 50
    },
    timeLimit: {
        type: Number,
        required: [true, "Time limit is required"],
        min: 5,
        default: 60
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Creator ID is required"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    numberOfQuestions: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Quiz = model('Quiz', quizSchema);

export default Quiz;
