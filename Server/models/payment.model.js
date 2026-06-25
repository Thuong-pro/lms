import {model, Schema} from 'mongoose';

/**
 * @paymentSchema - Mongoose schema for storing payment information related to Razorpay transactions.
 * This schema captures the necessary details of a payment, including payment ID, subscription ID, and signature.
 */
const payamentSchema =new Schema({
    razorpay_payment_id:{
        type:String,
        required:true
    },
    razorpay_subscription_id:{
        type:String,
        required:true
    },
    razorpay_signature:{
        type:String,
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    courseId:{
        type:Schema.Types.ObjectId,
        ref:'Course',
        required:true
    },
    amount:{
        type:Number,
        default:0
    }
},{
    timestamps:true
});

const Payment = model('Payment', payamentSchema);

export default Payment;