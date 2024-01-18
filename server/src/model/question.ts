import { AggregatePaginateModel, Schema, SchemaTypes, Types } from "mongoose"
import Post, { PostDoc } from "./post"

interface QuestionDoc extends PostDoc {
    title: string
    views: number
    tags: Types.ObjectId[]
}

type QuestionModel = AggregatePaginateModel<QuestionDoc>
const schema = new Schema<QuestionDoc, QuestionModel>({
    title: {
        type: String,
        required: [true, "title cannot be empty"],
        max: [50, "Title cannot be more than 50 characters"]
    },
    views: {
        type: Number,
        default: () => 0
    },
    tags: {
        type: [{ 
            type: SchemaTypes.ObjectId, 
            ref: "Tag",
            required: true,
            unqiue: true
        }],
        required: [true, "tags cannot be empty"]
    }
})
schema.virtual("answers", {
    ref: "Answer",
    localField: "_id",
    foreignField: "parent"
})

const Question = Post.discriminator<QuestionDoc, QuestionModel>("Question", schema)
export default Question

export type QuestionDocument = ReturnType<(typeof Question)["hydrate"]>
