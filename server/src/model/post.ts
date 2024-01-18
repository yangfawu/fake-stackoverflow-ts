import { PostType, TIMESTAMP_CONFIG } from "@config/mongoose"
import { AggregatePaginateModel, Schema, SchemaTypes, Types, model } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

export interface PostDoc extends WithTimestamps {
    text: string
    author: Types.ObjectId
    votes: number
    type: PostType
    parent?: Types.ObjectId
}

const schema = new Schema({
    text: {
        type: String,
        required: [true, "text cannot be empty"],
    },
    author: {
        type: SchemaTypes.ObjectId,
        ref: "User",
        required: true
    },
    votes: {
        type: Number,
        default: () => 0
    },
    type: {
        type: String,
        required: [true, "type cannot be empty"],
        enum: Object.values(PostType)
    },
    parent: {
        type: SchemaTypes.ObjectId,
        ref: "Post"
    }
}, {
    ...TIMESTAMP_CONFIG,
    discriminatorKey: "type"
})
schema.set("toJSON", { 
    virtuals: true,
    transform(_, ret) {
        delete ret.id
        return ret
    }
})
// schema.set("toObject", { 
//     virtuals: true,
//     transform(_, ret) {
//         delete ret.id
//         return ret
//     }
// })
schema.virtual("vote_refs", {
    ref: "Vote",
    localField: "_id",
    foreignField: "post"
})
schema.plugin(mongooseAggregatePaginate)

const Post = model<PostDoc, AggregatePaginateModel<PostDoc>>("Post", schema, "posts")
export default Post

export type PostDocument = ReturnType<(typeof Post)["hydrate"]>
