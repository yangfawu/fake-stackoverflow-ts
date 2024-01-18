import { Role, TIMESTAMP_CONFIG } from "@config/mongoose"
import { PaginateModel, Schema, model } from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2"

interface UserDoc extends WithTimestamps {
    name: string
    email: string
    password_hash: string
    role: Role
    reputation: number
}

const schema = new Schema({
    name: {
        type: String,
        required: [true, "name cannot be empty"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "email cannot be empty"],
        unqiue: true
    },
    password_hash: {
        type: String,
        required: [true, "password_hash cannot be empty"]
    },
    role: {
        type: String,
        required: [true, "role cannot be empty"],
        enum: Object.values(Role)
    },
    reputation: {
        type: Number,
        required: true,
        default: () => 100
    }
}, TIMESTAMP_CONFIG)
schema.plugin(mongoosePaginate)

const User = model<UserDoc, PaginateModel<UserDoc>>("User", schema, "users")
export default User

export type UserDocument = ReturnType<(typeof User)["hydrate"]>
