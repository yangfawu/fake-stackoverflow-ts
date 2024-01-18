import CommentController from "@controller/comment"
import checkToken from "@middleware/check-token"
import sendValidationErrors from "@middleware/send-validation-errors"
import { Router } from "express"
import { body, param, query } from "express-validator"

const commentRouter = Router()

/**
 * Takes a [pid], which can be the ID of a question or answer.
 * Returns a list of comments associated with target question or answer.
 * The results is paginated.
 */
commentRouter.get("/:pid", [
    checkToken,
    param("pid")
        .exists()
        .isMongoId(),
    query("page")
        .default(1)
        .isInt({ min: 1 })
        .toInt(),
    query("size")
        .default(10)
        .isInt({ min: 1, max: 20 })
        .toInt(),
    sendValidationErrors
], CommentController.getAll)

commentRouter.get("/specific/:pid", [
    checkToken,
    param("pid")
        .exists()
        .isMongoId(),
    sendValidationErrors
], CommentController.get)

/**
 * Takes in a bunch of fields to create a new comment.
 * Expects an [id] field and a [type] field to tell the system whether we are adding to Question or Answer.
 * Returns the newly created comment.
 */
commentRouter.post("/new", [
    checkToken,
    body("pid")
        .exists()
        .isMongoId(),
    body("text")
        .exists()
        .isString()
        .trim()
        .isLength({ min: 1 }),
    sendValidationErrors
], CommentController.create)

/**
 * Takes in a [pid] and updates the text of the associated comment.
 */
commentRouter.post("/:pid", [
    checkToken,
    param("pid")
        .exists()
        .isMongoId(),
    body("text")
        .exists()
        .isString()
        .trim()
        .isLength({ min: 1 }),
    sendValidationErrors
], CommentController.update)

/**
 * Takes in a [pid] and deletes the target comment
 */
commentRouter.delete("/:pid", [
    checkToken,
    param("pid")
        .exists()
        .isMongoId(),
    sendValidationErrors
], CommentController.remove)

export default commentRouter
