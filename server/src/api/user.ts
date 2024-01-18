import UserController from "@controller/user"
import checkAdmin from "@middleware/check-admin"
import checkToken from "@middleware/check-token"
import sendValidationErrors from "@middleware/send-validation-errors"
import { Router } from "express"
import { body, param, query } from "express-validator"

const userRouter = Router()

/**
 * Takes a [:name] and updates information about the associated user.
 * Will fail if non-admin user tries to update another user.
 */
userRouter.post("/:name", [
    checkToken,
    param("name")
        .exists()
        .isString()
        .trim()
        .isLength({ min: 1 }),
    body("name")
        .exists()
        .isString()
        .trim()
        .isLength({ min: 1 }),
    sendValidationErrors
], UserController.update)

/**
 * Takes a [:name] and deletes the associated user.
 * Only an admin can use this functionality.
 */
userRouter.delete("/:name", [
    checkToken,
    checkAdmin,
    param("name")
        .exists()
        .isString()
        .trim()
        .isLength({ min: 1 }),
    sendValidationErrors
], UserController.remove)

/**
 * Returns a list of users.
 * The results is paginated.
 * Only an admin can use this functionality.
 */
userRouter.get("/all", [
    checkToken,
    checkAdmin,
    query("page")
        .default(1)
        .isInt({ min: 1 })
        .toInt(),
    query("size")
        .default(10)
        .isInt({ min: 1, max: 20 })
        .toInt(),
    sendValidationErrors
], UserController.getAll)

/**
 * Takes a [:name] and returns information about the associated user.
 * Anyone can use this endpoint, so sensitive information is filtered out.
 * NOTE: MUST BE PLACED AFTER /all
 */
userRouter.get("/:name", [
    param("name")
        .exists()
        .isString()
        .trim()
        .isLength({ min: 1 }),
    sendValidationErrors
], UserController.get)

export default userRouter
