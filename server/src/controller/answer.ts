import { Role } from "@config/mongoose"
import { ForbiddenError } from "@error/auth"
import { MissingResourceError } from "@error/resource"
import Answer from "@model/answer"
import Question from "@model/question"
import { UserDocument } from "@model/user"
import { VoteDocument } from "@model/vote"
import PostService from "@service/post"
import type { NextFunction, Request, Response } from "express"

async function create(req: Request, res: Response, next: NextFunction) {
    const pid = String(req.body.pid)
    const question = await Question.findById(pid).exec()
    if (!question)
        return next(new MissingResourceError("question does not exist"))

    const text = String(req.body.text)
    const author: UserDocument = res.locals.user
    await Answer.create({
        author,
        text,
        parent: question
    })

    res.send({
        success: true,
        message: "answer created"
    })
}

async function update(req: Request, res: Response, next: NextFunction) {
    const pid = String(req.params.pid)
    const answer = await Answer.findById(pid).exec()
    if (!answer)
        return next(new MissingResourceError("answer does not exist"))

    const editor: UserDocument = res.locals.user
    if (!answer.author._id.equals(editor._id) && editor.role !== Role.ADMIN)
        return next(new ForbiddenError("no perms to modify answer"))

    const text = String(req.body.text)
    answer.text = text
    await answer.save()

    res.send({
        success: true,
        message: "answer updated"
    })
}

async function remove(req: Request, res: Response, next: NextFunction) {
    const pid = String(req.params.pid)
    const answer = await Answer.findById(pid)
        .populate<{ vote_refs: VoteDocument[] }>("vote_refs")
        .exec()
    if (!answer)
        return next(new MissingResourceError("answer does not exist"))

    const editor: UserDocument = res.locals.user
    if (!answer.author._id.equals(editor._id) && editor.role !== Role.ADMIN)
        return next(new ForbiddenError("no perms to delete answer"))

    await PostService.deletePostsAndRelatedPosts([answer])

    res.send({
        success: true,
        message: "answer deleted"
    })
}

async function get(req: Request, res: Response, next: NextFunction) {
    const pid = String(req.params.pid)
    const answer = await Answer.findById(pid)
        .exec()
    if (!answer)
        return next(new MissingResourceError("answer does not exist"))
    res.send({
        success: true,
        data: answer
    })
}

const AnswerController = {
    create,
    update,
    remove,
    get
}
export default AnswerController
