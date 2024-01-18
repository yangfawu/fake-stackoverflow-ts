import AnswerController from "@controller/answer"
import checkToken from "@middleware/check-token"
import sendValidationErrors from "@middleware/send-validation-errors"
import { Router } from "express"
import { body, param } from "express-validator"

const answerRouter = Router()

/**
 * Takes in a bunch of fields to create a new answer for a question.
 * The [pid] is expected to be included among the fields.
 */
answerRouter.post("/new", [
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
], AnswerController.create)


answerRouter.get("/:pid", [
    checkToken,
    param("pid")
        .exists()
        .isMongoId(),
    sendValidationErrors
], AnswerController.get)

/**
 * Takes a [pid] and the new text.
 * Will update the answer on the database with the new text.
 */
answerRouter.post("/:pid", [
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
], AnswerController.update)

/**
 * Takes a [pid] and removes the associated answer from the database.
 * System will remove any references (votes, question, comments)
 */
answerRouter.delete("/:pid", [
    checkToken,
    param("pid")
        .exists()
        .isMongoId(),
    sendValidationErrors
], AnswerController.remove)

export default answerRouter
