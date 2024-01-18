import { Role } from "@config/mongoose"
import { ForbiddenError } from "@error/auth"
import { MissingResourceError } from "@error/resource"
import Post from "@model/post"
import Tag from "@model/tag"
import User, { UserDocument } from "@model/user"
import { VoteDocument } from "@model/vote"
import PostService from "@service/post"
import type { NextFunction, Request, Response } from "express"

async function getAll(req: Request, res: Response) {
    // const uid = String(res.locals.uid)
    const page = Number(req.query.page)
    const limit = Number(req.query.size)
    
    const data = await User.paginate(
        { 
            // _id: { $ne: uid } // filter out the admin requester
        }, 
        {
            select: {
                email: 0,
                password_hash: 0
            },
            sort: {
                name: 1
            },
            page,
            limit,
            
        }
    )
    res.send({
        success: true,
        data
    })
}

async function get(req: Request, res: Response) {
    const name = String(req.params.name)
    const data = await User.findOne({ name }, { 
        email: 0,
        password_hash: 0 
    }).exec()

    res.send({
        success: true,
        data
    })
}

async function update(req: Request, res: Response, next: NextFunction) {
    const targetName = String(req.params.name)
    const requester: UserDocument = res.locals.user
    if (requester.name != targetName && requester.role !== Role.ADMIN)
        return next(new ForbiddenError("cannot edit ohter user names"))

    const newName = String(req.body.name)
    if (requester.name === targetName) {
        requester.name = newName
        await requester.save()
    } else {
        if (requester.role !== Role.ADMIN)
            return next(new ForbiddenError("cannot edit ohter user names"))

        const targetUser = await User.findOne({ name: targetName }).exec()
        if (!targetUser)
            return next(new MissingResourceError("user name not found"))

        targetUser.name = newName
        await targetUser.save()
    }

    res.send({
        success: true,
        message: "updated name"
    })
}

async function remove(req: Request, res: Response, next: NextFunction) {
    const name = String(req.params.name)
    const targetUser = await User.findOne({ name }).exec()
    if (!targetUser)
        return next(new MissingResourceError("user name not found"))

    const admin: UserDocument = res.locals.user
    if (targetUser._id.equals(admin._id))
        return next(new ForbiddenError("cannot delete self"))

    if (targetUser.role === Role.ADMIN)
        return next(new ForbiddenError("cannot delete admin"))

    // find all posts by users and delete them along with related ones
    const posts_by_user = await Post.find({ author: targetUser })
        .populate<{ vote_refs: VoteDocument[] }>("vote_refs")
        .exec()
    await PostService.deletePostsAndRelatedPosts(posts_by_user)

    // transfer ownership of all tags to this admin
    await Tag.updateMany({ author: targetUser }, {
        author: admin
    }).exec()

    // finally delete the user
    await targetUser.deleteOne() 
    
    res.send({
        success: true,
        message: "user deleted"
    })
}

const UserController = {
    getAll,
    get,
    update,
    remove
}
export default UserController
