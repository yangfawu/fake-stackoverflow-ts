import { AggregatePaginateModel, Schema } from "mongoose"
import Post, { PostDoc } from "./post"

interface AnswerDoc extends PostDoc {
}

type AnswerModel = AggregatePaginateModel<AnswerDoc>
const schema = new Schema<AnswerDoc, AnswerModel>({})

const Answer = Post.discriminator<AnswerDoc, AnswerModel>("Answer", schema)
export default Answer

export type AnswerDocument = ReturnType<(typeof Answer)["hydrate"]>
