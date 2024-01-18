import { TIMESTAMP_CONFIG } from "@config/mongoose"
import { Model, Schema, SchemaTypes, Types, model } from "mongoose"

interface TagDoc extends WithTimestamps {
    name: string
    author: Types.ObjectId
}

type TagModel = Model<TagDoc>
const schema = new Schema<TagDoc, TagModel>({
    name: {
        type: String,
        required: [true, "name cannot be empty"],
        min: [1, "name must have at least 1 character"],
        unique: true
    },
    author: {
        type: SchemaTypes.ObjectId,
        ref: "User",
        required: true
    }
}, TIMESTAMP_CONFIG)

const Tag = model<TagDoc, TagModel>("Tag", schema, "tags")
export default Tag

export type TagDocument = ReturnType<(typeof Tag)["hydrate"]>
