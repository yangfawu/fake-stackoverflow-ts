import VoteController from "@controller/vote"
import checkToken from "@middleware/check-token"
import sendValidationErrors from "@middleware/send-validation-errors"
import { Router } from "express"
import { body, param } from "express-validator"

const voteRouter = Router()

/**
 * Returns a list of votes the currently logged-in user is associated with.
 */
voteRouter.get("/all", [
    checkToken
], VoteController.getAll)

/**
 * Takes a [pid] and finds all the votes from the logged-in user on this post and related ones.
 * Returns a list of such votes.
 */
voteRouter.get("/:pid", [
    checkToken,
    param("pid")
        .exists()
        .isMongoId(),
    sendValidationErrors
], VoteController.get)

/**
 * Takes a [pid] and sets the vote for the particular post.
 */
voteRouter.post("/:pid", [
    checkToken,
    param("pid")
        .exists()
        .isMongoId(),
    body("value")
        .exists()
        .isInt()
        .isIn([-1, 1]),
    sendValidationErrors
], VoteController.set)

/**
 * Takes a [pid] and removes the associated vote from the user.
 */
voteRouter.delete("/:pid", [
    checkToken,
    param("pid")
        .exists()
        .isMongoId(),
    sendValidationErrors
], VoteController.unset)

export default voteRouter
