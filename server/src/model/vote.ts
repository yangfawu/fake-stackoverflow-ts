import { TIMESTAMP_CONFIG } from "@config/mongoose"
import { Model, Schema, SchemaTypes, Types, model } from "mongoose"

interface VoteDoc extends WithTimestamps {
    post: Types.ObjectId
    user: Types.ObjectId
    value: number
}

type VoteModel = Model<VoteDoc>
const schema = new Schema<VoteDoc, VoteModel>({
    post: {
        type: SchemaTypes.ObjectId,
        ref: "Post",
        required: true
    },
    user: {
        type: SchemaTypes.ObjectId,
        ref: "Post",
        required: true
    },
    value: {
        type: Number,
        enum: [-1, 1],
        required: true
    }
}, TIMESTAMP_CONFIG)
schema.index({ post: 1, user: 1 }, { unique: true })

const Vote = model<VoteDoc, VoteModel>("Vote", schema, "votes")
export default Vote

export type VoteDocument = ReturnType<(typeof Vote)["hydrate"]>
