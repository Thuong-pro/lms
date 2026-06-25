import {model , Schema} from "mongoose";

/**
 * @courseSchema - Mongoose schema for Course.
 * This schema defines the structure and validation rules for course data, including title, description, category, thumbnail, lectures, and metadata.
 */

const courseSchema = new Schema({
    title:{
        type:String,
        required:[true, "Title is required" ],
        minLength:[8, "Title must be atleast 8 characters"],
        maxLength:[60,"Title should be less than 60 characters"],
        trim:true
    },
    description:{
        type: String,
        required:[true, "Description is required" ],
        minLength:[8, "Description must be atleast 8 characters"],
        maxLength:[200,"Description should be less than 200 characters"],
        trim:true
    },
    category:{
        type:String,
        required:[true, "Category is required" ],
    },
    thumbnail:{
        public_id:{
            type:String,
            required:true,
        },
        secure_url:{
            type:String,
            required:true,
        }
    },
    lectures:[
        {
            title:String,
            description:String,
            lecture:{
                public_id:{
                    type:String,
                    required:true,
                },
                secure_url:{
                    type:String,
                    required:true,
                }
            }
        }
    ],
    numberOfLectures:{
        type:Number,
        default:0,
    },
    createdBy:{
        type:String,
        required:true,
    },
    teacherId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:[true,"Teacher ID is required"]
    },
    quizzes:[
        {
            type:Schema.Types.ObjectId,
            ref:'Quiz'
        }
    ],
    enrolledStudents: [
        {
            studentId:{
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            status:{
                type:String,
                enum:['active','inactive'],
                default:'active'
            },
            enrolledAt:{
                type:Date,
                default:Date.now
            },
            progress:{
                type:Number,
                default:0
            }
        }
    ],
    numberOfStudents: {
        type: Number,
        default: 0
    }

},{
    timestamps:true
})

const Course = model('Course', courseSchema);

export default Course;