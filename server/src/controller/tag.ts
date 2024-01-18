import { Role } from "@config/mongoose"
import { ForbiddenError } from "@error/auth"
import { MissingResourceError } from "@error/resource"
import Question from "@model/question"
import Tag from "@model/tag"
import { UserDocument } from "@model/user"
import type { NextFunction, Request, Response } from "express"
import { Document, Types } from "mongoose"

async function getAll(_: Request, res: Response) {
    const data = await Tag.aggregate([
        {
            // look for all questions that reference tag
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "tags",
                as: "questions"
            }
        },
        {
            // tally up the questions for each tag
            $project: {
                name: 1,
                count: { $size: "$questions" }
            }
        },
        {
            // for consistent search results, we sort by tag name
            $sort: {
                name: 1
            }
        },
    ]).exec()
    res.send({
        success: true,
        data
    })
}

async function update(req: Request, res: Response, next: NextFunction) {
    const tid = String(req.params.tid)
    const name = String(req.body.name)

    try {
        const user: UserDocument = res.locals.user
        if (user.role === Role.ADMIN) {
            const data = await Tag.findOneAndUpdate({ _id: tid }, { name }, { new: true })
                .orFail(new MissingResourceError("tag not found"))
                .exec()
            return res.send({
                success: true,
                data
            })
        }
    
        // we don't search by just tag ID 
        // we need the user to be owner of tag
        const data = await Tag.findOneAndUpdate({ _id: tid, author: user._id }, { name }, { new: true })
            .orFail(new MissingResourceError("tag made by you not found"))
            .exec()
        res.send({
            success: true,
            data
        })
    } catch (err) {
        next(err)
    }
}

async function remove(req: Request, res: Response, next: NextFunction) {
    const tid = String(req.params.tid)

    try {
        const tag = await Tag.findById(tid)
            .orFail(new MissingResourceError("tag not found"))
            .exec()
        
        const user: UserDocument = res.locals.user
        if (user.role !== Role.ADMIN && !tag.author.equals(user._id))
            throw new ForbiddenError("no permissions to delete tag")
        
        // locate all the authors of the questions that use the tag
        const authors_using_tag: Document<Types.ObjectId>[] = await Question.aggregate([
            {
                // find all questions containing the target tag
                $match: {
                    tags: tag._id,
                }
            },
            {
                // group all matched questions by their author
                $group: {
                    _id: "$author"
                }
            }
        ]).exec()

        // ensure that criteria is met before tag can be deleted from associated questions
        switch (authors_using_tag.length) {
            case 0:
                break
            case 1: {
                if (user.role !== Role.ADMIN && authors_using_tag[0]._id?.equals(user._id))
                    throw new Error("unreachable error")
            }
            default: {
                if (user.role !== Role.ADMIN)
                    throw new ForbiddenError("more than one author using tag")
            }
        }

        // remove tag from related questions
        await Question.updateMany(
            { tags: tag._id },
            { $pull: { tags: tag._id } }    
        ).exec()

        // remove the tag itself
        await tag.deleteOne()
        
        res.send({ 
            success: true,
            message: "removed"
        })
    } catch (err) {
        next(err)
    }
}

const TagController = {
    getAll,
    update,
    remove
}
export default TagController
