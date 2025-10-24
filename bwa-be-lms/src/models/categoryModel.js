import mongoose from "mongoose";
import { required } from "zod/mini";

const categoryModel = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ]
}, {
    timestamp: true
})

export default mongoose.model('Category', categoryModel)