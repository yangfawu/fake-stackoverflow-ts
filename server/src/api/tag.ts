import TagController from "@controller/tag"
import checkToken from "@middleware/check-token"
import sendValidationErrors from "@middleware/send-validation-errors"
import { Router } from "express"
import { body, param } from "express-validator"

const tagRouter = Router()

/**
 * Returns a list of all tags on the system.
 */
tagRouter.get("/all", TagController.getAll)

/**
 * Takes a [tid] and updates the associated tag name.
 * Returns the updated tag.
 */
tagRouter.post("/:tid", [
    checkToken,
    param("tid")
        .exists()
        .isMongoId(),
    body("name")
        .exists()
        .isString()
        .toLowerCase()
        .trim()
        .isLength({ min: 1 }),
    sendValidationErrors
], TagController.update)

/**
 * Takes a [tid] and deletes the associated tag.
 */
tagRouter.delete("/:tid", [
    checkToken,
    param("tid")
        .exists()
        .isMongoId(),
    sendValidationErrors
], TagController.remove)

export default tagRouter
