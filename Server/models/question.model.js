import { Schema, model } from "mongoose";

/**
 * @questionSchema - Mongoose schema for Quiz Questions.
 * Defines multiple choice questions with options and correct answer.
 */

const questionSchema = new Schema({
    quizId: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
        required: [true, "Quiz ID is required"]
    },
    questionText: {
        type: String,
        required: [true, "Question text is required"],
        minLength: [10, "Question must be at least 10 characters"],
        maxLength: [500, "Question should be less than 500 characters"],
        trim: true
    },
    options: [
        {
            label: {
                type: String,
                enum: ['A', 'B', 'C', 'D'],
                required: true
            },
            text: {
                type: String,
                required: [true, "Option text is required"],
                maxLength: [200, "Option should be less than 200 characters"],
                trim: true
            }
        }
    ],
    correctAnswer: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
        required: [true, "Correct answer is required"]
    },
    score: {
        type: Number,
        required: [true, "Score is required"],
        min: 1,
        default: 1
    },
    explanation: {
        type: String,
        maxLength: [500, "Explanation should be less than 500 characters"],
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    }
}, {
    timestamps: true
});

const Question = model('Question', questionSchema);

export default Question;
