import { Schema, model } from "mongoose";

/**
 * @quizSubmissionSchema - Mongoose schema for Quiz Submissions.
 * Tracks student quiz attempts, answers, and scores.
 */

const quizSubmissionSchema = new Schema({
    quizId: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
        required: [true, "Quiz ID is required"]
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID is required"]
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, "Course ID is required"]
    },
    answers: [
        {
            questionId: {
                type: Schema.Types.ObjectId,
                ref: 'Question',
                required: true
            },
            selectedAnswer: {
                type: String,
                enum: ['A', 'B', 'C', 'D'],
                required: [true, "Selected answer is required"]
            },
            isCorrect: {
                type: Boolean,
                default: false
            },
            score: {
                type: Number,
                default: 0
            },
            timeSpent: {
                type: Number,
                default: 0
            }
        }
    ],
    score: {
        type: Number,
        required: true,
        default: 0
    },
    totalMarks: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        default: 0
    },
    passed: {
        type: Boolean,
        default: false
    },
    timeSpent: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['submitted', 'reviewed', 'graded'],
        default: 'submitted'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewComments: {
        type: String
    }
}, {
    timestamps: true
});

const QuizSubmission = model('QuizSubmission', quizSubmissionSchema);

export default QuizSubmission;
