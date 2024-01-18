import { AggregatePaginateModel, Schema } from "mongoose"
import Post, { PostDoc } from "./post"

interface CommentDoc extends PostDoc {
}

type CommentModel = AggregatePaginateModel<CommentDoc>
const schema = new Schema({})

const Comment = Post.discriminator<CommentDoc, CommentModel>("Comment", schema)
export default Comment

export type CommentDocument = ReturnType<(typeof Comment)["hydrate"]>
