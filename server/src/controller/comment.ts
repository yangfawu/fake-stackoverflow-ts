import { PostType, Role } from "@config/mongoose"
import { ForbiddenError } from "@error/auth"
import { MissingResourceError } from "@error/resource"
import Comment from "@model/comment"
import Post from "@model/post"
import { UserDocument } from "@model/user"
import { VoteDocument } from "@model/vote"
import PostService from "@service/post"
import type { NextFunction, Request, Response } from "express"

async function getAll(req: Request, res: Response, next: NextFunction) {
    const pid = String(req.params.pid)
    const post = await Post.findById(pid).exec()
    if (!post)
        return next(new MissingResourceError("post does not exist"))

    if (post.type === PostType.COMMENT)
        return next(new ForbiddenError("post is a comment"))

    const aggregate = Comment.aggregate()
    aggregate.match({ parent: post._id })
    aggregate.sort({ created_at: -1 })

    aggregate.lookup({
        from: "users",
        foreignField: "_id",
        localField: "author",
        as: "author"
    })
    aggregate.unwind({
        path: "$author"
    })
    
    const page = Number(req.query.page)
    const limit = Number(req.query.size)
    const data = await Comment.aggregatePaginate(
        aggregate,
        { page, limit }
    )

    res.send({
        success: true,
        data
    })
}

async function create(req: Request, res: Response, next: NextFunction) {
    const pid = String(req.body.pid)
    const post = await Post.findById(pid).exec()
    if (!post)
        return next(new MissingResourceError("post does not exist"))

    if (post.type === PostType.COMMENT)
        return next(new ForbiddenError("post is a comment"))

    const author: UserDocument = res.locals.user
    if (author.role !== Role.ADMIN && author.reputation < 50)
        return next(new ForbiddenError("not enough reputation to make a comment"))

    const text = String(req.body.text)
    await Comment.create({
        author,
        text,
        parent: post
    })

    res.send({
        success: true,
        message: "comment created"
    })
}

async function update(req: Request, res: Response, next: NextFunction) {
    const pid = String(req.params.pid)
    const comment = await Comment.findById(pid).exec()
    if (!comment)
        return next(new MissingResourceError("comment does not exist"))

    const editor: UserDocument = res.locals.user
    if (!comment.author._id.equals(editor._id) && editor.role !== Role.ADMIN)
        return next(new ForbiddenError("not allowed to modify comment"))

    const text = String(req.body.text)
    comment.text = text
    await comment.save()

    res.send({
        success: true,
        message: "comment updated"
    })
}

async function remove(req: Request, res: Response, next: NextFunction) {
    const pid = String(req.params.pid)
    const comment = await Comment.findById(pid)
        .populate<{ vote_refs: VoteDocument[] }>("vote_refs")
        .exec()
    if (!comment)
        return next(new MissingResourceError("comment does not exist"))

    const editor: UserDocument = res.locals.user
    if (!comment.author._id.equals(editor._id) && editor.role !== Role.ADMIN)
        return next(new ForbiddenError("not allowed to modify comment"))

    await PostService.deletePostsAndRelatedPosts([comment])

    res.send({
        success: true,
        message: "comment deleted"
    })
}

async function get(req: Request, res: Response, next: NextFunction) {
    const pid = String(req.params.pid)
    const comment = await Comment.findById(pid)
        .exec()
    if (!comment)
        return next(new MissingResourceError("comment does not exist"))
    res.send({
        success: true,
        data: comment
    })
}

const CommentController = {
    getAll,
    create,
    update,
    remove,
    get
}
export default CommentController
