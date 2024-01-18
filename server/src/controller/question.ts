import { PostType, Role } from "@config/mongoose"
import { ForbiddenError } from "@error/auth"
import { MissingResourceError } from "@error/resource"
import Question from "@model/question"
import { TagDocument } from "@model/tag"
import { UserDocument } from "@model/user"
import { VoteDocument } from "@model/vote"
import PostService from "@service/post"
import TagService from "@service/tag"
import type { NextFunction, Request, Response } from "express"

const QUERY_REGEX = /(\[(?<tag>[^[\]]+)]|(?<word>\w+))/g
async function getAll(req: Request, res: Response) {
    const query_text = String(req.query.query)

    // compute the tags and search terms we need to look for
    const tags_names = new Set<string>()
    const search_terms = new Set<string>()
    for (const { groups } of query_text.matchAll(QUERY_REGEX)) {
        if (!groups)
            continue
        const { tag, word } = groups
        if (tag)
            tags_names.add(tag)
        if (word)
            search_terms.add(word)
    }

    const aggregate = Question.aggregate()
        
    // include text-searching if we have words to look for
    if (search_terms.size > 0) {
        const $regex = new RegExp(Array.from(search_terms).join("|"), "i")
        aggregate.match({
            $or: [
                { title: { $regex } },
                { text: { $regex } }
            ]
        })
    }

    // look up tags to perform name searching
    aggregate.lookup({
        from: "tags",
        localField: "tags",
        foreignField: "_id",
        as: "tags"
    })

    // include tag searching if any
    if (tags_names.size > 0) {
        aggregate.match({
            "tags": {
                $elemMatch: { 
                    name: { $in: Array.from(tags_names) }
                }
            }
        })
    }

    // look up related answers
    aggregate.lookup({
        from: "posts",
        localField: "_id",
        foreignField: "parent",
        as: "answers",
        pipeline: [
            {
                $match: { type: PostType.ANSWER }
            }
        ]
    })

    // compute count
    aggregate.addFields({
        answers: {
            $size: "$answers"
        },
    })
    
    // apply mode
    const mode = String(req.query.mode)
    switch (mode) {
        case "active": {
            // filter out all questions that have NO answers
            aggregate.match({
                answers: { $gt: 0 }
            })

            // populate information about each answer and determine the latest reply time
            aggregate.lookup({
                from: "posts",
                localField: "_id",
                foreignField: "parent",
                as: "latest_reply_time",
                pipeline: [
                    {
                        $match: { type: PostType.ANSWER }
                    },
                    {
                        // we group by nothing, but this will tell mongo we want to do an aggregate
                        $group: {
                            _id: null,
                            result: { $max: "$created_at" }
                        }
                    }
                ]
            })

            // the previous aggregate used to get latest reply time comes in the form of an array
            // since this array is always just 1 element, we remove it
            aggregate.unwind("latest_reply_time")
            aggregate.addFields({
                latest_reply_time: "$latest_reply_time.result"
            })

            // sort the latest time in descending order
            aggregate.sort({ latest_reply_time: -1 })
            break
        }
        case "unanswered": {
            // filter out all questions that have answers
            aggregate.match({ answers: 0 })

            // break is purposely not added here to apply changes from newest
            // break
        }
        case "newest":
        default: {
            aggregate.sort({ created_at: -1 })
            break
        }
    }

    aggregate.lookup({
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
        pipeline: [
            {
                $project: {
                    email: 0,
                    password_hash: 0
                }
            }
        ]
    })
    aggregate.unwind({
        path: "$author"
    })

    const page = Number(req.query.page)
    const limit = Number(req.query.size)
    const data = await Question.aggregatePaginate(
        aggregate, 
        { page, limit }
    )

    res.send({
        success: true,
        data
    })
}

async function get(req: Request, res: Response, next: NextFunction) {
    const pid = String(req.params.pid)

    const data = await Question.findByIdAndUpdate(pid, 
        {
            $inc: { views: 1 }
        },
        {
            returnDocument: "after",
            populate: [
                {
                    path: "author",
                    select: {
                        email: 0,
                        password_hash: 0
                    }
                },
                {
                    path: "tags",
                    select: {
                        author: 0,
                    }
                },
                {
                    path: "answers",
                    populate: {
                        path: "author",
                        select: {
                            email: 0,
                            password_hash: 0
                        }
                    }
                }
            ]
        }
    ).exec()
    if (!data)
        return next(new MissingResourceError("question does not exist"))

    res.send({
        success: true,
        data
    })
}

async function create(req: Request, res: Response, next: NextFunction) {
    const author: UserDocument = res.locals.user
    const title = String(req.body.title)
    const text = String(req.body.text)

    // determine the tags we need for the question
    const tags_text = String(req.body.tags)
    const tags: TagDocument[] = []
    try {
        await TagService.upsertTags(tags, tags_text, author)
    } catch (err) {
        if (err instanceof ForbiddenError)
            return next(err)
        throw err
    }

    const data = await Question.create({
        title,
        text,
        tags,
        author
    })
    res.send({
        success: true,
        data
    })
}

async function update(req: Request, res: Response, next: NextFunction) {
    const pid = String(req.params.pid)
    const question = await Question.findById(pid).exec()
    if (!question)
        return next(new MissingResourceError("question not found"))

    // allow editor to proceed if they authored it or they are an admin
    const editor: UserDocument = res.locals.user
    if (!question.author._id.equals(editor._id) && editor.role !== Role.ADMIN)
        return next(new ForbiddenError("not allowed to modify question"))

    // apply new title if any
    if ("title" in req.body)
        question.title = String(req.body.title)

    // apply new text if any
    if ("text" in req.body)
        question.text = String(req.body.text)

    // apply new tags if any
    if ("tags" in req.body) {
        const tags_text = String(req.body.tags)
        const tags: TagDocument[] = []
        try {
            TagService.upsertTags(tags, tags_text, editor)
        } catch (err) {
            if (err instanceof ForbiddenError)
                return next(err)
            throw err
        }
    }

    await question.save()
    res.send({
        success: true,
        message: "question updated"
    })
}

async function remove(req: Request, res: Response, next: NextFunction) {
    const pid = String(req.params.pid)
    const question = await Question.findById(pid)
        .populate<{ vote_refs: VoteDocument[] }>("vote_refs")
        .exec()
    if (!question)
        return next(new MissingResourceError("question not found"))

    // allow editor to proceed if they authored it or they are an admin
    const editor: UserDocument = res.locals.user
    if (!question.author._id.equals(editor._id) && editor.role !== Role.ADMIN)
        return next(new ForbiddenError("not allowed to modify question"))

    await PostService.deletePostsAndRelatedPosts([question])
    res.send({
        success: true,
        message: "question deleted"
    })
}

const QuestionController = {
    getAll,
    get,
    create,
    update,
    remove
}
export default QuestionController
