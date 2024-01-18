import QuestionController from "@controller/question"
import checkToken from "@middleware/check-token"
import sendValidationErrors from "@middleware/send-validation-errors"
import { Router } from "express"
import { body, param, query } from "express-validator"

const questionRouter = Router()

/**
 * Querying is supported.
 * Returns a list of questions.
 * The results are paginated.
 */
questionRouter.get("/all", [
    query("query")
        .default("")
        .isString()
        .trim(),
    query("mode")
        .default("newest")
        .isString()
        .trim()
        .isIn(["newest", "active", "unanswered"]),
    query("page")
        .default(1)
        .isInt({ min: 1 })
        .toInt(),
    query("size")
        .default(10)
        .isInt({ min: 1, max: 20 })
        .toInt(),
    sendValidationErrors
], QuestionController.getAll)

/**
 * Takes in a [pid] and gets all the information about the target question
 * The information does not include comments or answers.
 */
questionRouter.get("/:pid", [
    param("pid")
        .exists()
        .isMongoId(),
    sendValidationErrors
], QuestionController.get)

/**
 * Takes in a bunch of fields and create a new question.
 * Returns the new question if successful
 */
questionRouter.post("/new", [
    checkToken,
    body("title")
        .exists()
        .isString()
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("text")
        .exists()
        .isString()
        .trim()
        .isLength({ min: 1, max: 140 }),
    body("tags")
        .exists()
        .isString()
        .trim()
        .toLowerCase()
        .isLength({ min: 1 }),
    sendValidationErrors
], QuestionController.create)

/**
 * Takes in a [pid] and updates the title or text of the target question.
 * Returns the new question if successful
 */
questionRouter.post("/:pid", [
    checkToken,
    param("pid")
        .exists()
        .isMongoId(),
    body("title")
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 50 }),
    body("text")
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 140 }),
    body("tags")
        .optional()
        .isString()
        .trim()
        .toLowerCase()
        .isLength({ min: 1 }),
    sendValidationErrors
], QuestionController.update)

/**
 * Takes in a [pid] and deletes the target question.
 * Associated votes, answers (and their comments & votes), comments (and their votes) will be deleted too.
 */
questionRouter.delete("/:pid", [
    checkToken,
    param("pid")
        .exists()
        .isMongoId(),
    sendValidationErrors
], QuestionController.remove)

export default questionRouter
