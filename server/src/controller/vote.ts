import { PostType } from "@config/mongoose"
import { ForbiddenError } from "@error/auth"
import { MissingResourceError } from "@error/resource"
import Post, { PostDocument } from "@model/post"
import User from "@model/user"
import Vote, { VoteDocument } from "@model/vote"
import PostService from "@service/post"
import type { NextFunction, Request, Response } from "express"

async function get(req: Request, res: Response, next: NextFunction) {
    const pid = String(req.params.pid)
    const post = await Post.findById(pid)
        .populate<{ vote_refs: VoteDocument[] }>("vote_refs")
        .exec()
    if (!post)
        return next(new MissingResourceError("post not found"))

    // discover all posts related to this one
    const all_posts = await PostService.discoverRelatedPosts([post])
    all_posts.push(post)

    // find all votes that involves the discovered posts
    const uid = String(res.locals.uid)
    const data = await Vote.find({
        post: { $in: all_posts },
        user: uid
    }).exec()

    res.send({
        success: true,
        data
    })
}

async function set(req: Request, res: Response, next: NextFunction) {
    // find post
    const pid = String(req.params.pid)
    const post = await Post.findById(pid).exec()
    if (!post)
        return next(new MissingResourceError("post not found"))

    const uid = String(res.locals.uid)
    const value = Number(req.body.value)

    // check if we have a vote already
    const exisitingVote = await Vote.findOne({ user: uid, post: pid })
        .populate<{ post: PostDocument }>("post")
        .exec()

    if (exisitingVote !== null) {
        if (exisitingVote.value === value)
            return next(new ForbiddenError("cannot apply the same vote"))

        console.log("updating existing vote", exisitingVote.value, "->", value)
        exisitingVote.value = value
        await exisitingVote.save()

        // the vote existed, but we are flipping it
        switch (exisitingVote.post.type) {
            case PostType.QUESTION:
            case PostType.ANSWER: {
                // apply vote change
                console.log("votes before", )
                if (value > 0) {
                    // previous vote was a downvote, then we need to increment by 2
                    exisitingVote.post.votes += 2
                } else {
                    // previous vote was upvote, so we need to decrement by 2
                    exisitingVote.post.votes -= 2
                }
                
                // find poster
                const poster = await User.findById(exisitingVote.post.author)
                    .exec()
                if (poster) {
                    if (value > 0) {
                        // previous vote was a downvote
                        // we need to revert reputation cost 
                        // and give more
                        poster.reputation += 10
                        poster.reputation += 5
                    } else {
                        // else do the opposite
                        poster.reputation -= 5
                        poster.reputation -= 10
                    }

                    await poster.save()
                }
                break
            }
            case PostType.COMMENT: {
                // only apply vote if it's an upvote
                // unreachable ebcause comment either has an upvote or no upvote
                throw new Error("unreacable")
            }
            default:
                throw new Error("unreacable")
        }

        // apply changes to post
        await exisitingVote.post.save()

        res.send({
            success: true,
            message: "vote set"
        })
    } else {
        // now we know there was never a vote before
        await Vote.create({ user: uid, post: pid, value })

        // apply rewards/punishments on poster
        // apply chanegs on post
        switch (post.type) {
            case PostType.QUESTION:
            case PostType.ANSWER: {
                // apply vote change
                post.votes += value

                // find poster
                const poster = await User.findById(post.author)
                    .exec()
                if (poster) {
                    poster.reputation += value > 0 ? 5 : -10
                    await poster.save()
                }
                break
            }
            case PostType.COMMENT: {
                // only apply vote if it's an upvote
                if (value > 0) {
                    post.votes += 1
                }
                break
            }
            default:
                throw new Error("unreacable")
        }

        // apply changes to post
        await post.save()

        res.send({
            success: true,
            message: "vote set"
        })
    }
}

async function unset(req: Request, res: Response, next: NextFunction) {
    const uid = String(res.locals.uid)
    const pid = String(req.params.pid)

    // find user's vote
    const vote = await Vote.findOne({ user: uid, post: pid })
        .populate<{ post: PostDocument }>("post")
        .exec()
    if (!vote)
        return next(new MissingResourceError("vote not found"))

    // apply update on post's votes score
    vote.post.votes -= vote.value
    
    await vote.post.save()

    // apply rewards/punishments on poster
    switch (vote.post.type) {
        case PostType.QUESTION:
        case PostType.ANSWER: {
            const poster = await User.findById(vote.post.author)
                .exec()
            if (poster) {
                poster.reputation -= vote.value > 0 ? 5 : -10
                await poster.save()
            }
            break
        }
        case PostType.COMMENT:
            break
        default:
            throw new Error("unreacable")
    }

    // remove vote from database
    await vote.deleteOne()

    res.send({
        success: true,
        message: "vote unset"
    })
}

async function getAll(_: Request, res: Response) {
    const uid = String(res.locals.uid)
    const data = await Vote.find({ user: uid })
        .populate("post", "text type title")
        .exec()
    res.send({
        success: true,
        data
    })
}

const VoteController = {
    getAll,
    get,
    set,
    unset
}
export default VoteController
