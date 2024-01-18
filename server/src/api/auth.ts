import { STRONG_PW_OPTS } from "@config/validator"
import AuthController from "@controller/auth"
import sendValidationErrors from "@middleware/send-validation-errors"
import { Router } from "express"
import { body } from "express-validator"

const authRouter = Router()

/**
 * Takes in a bunch of fields for creating a new user.
 */
authRouter.post("/register", [
    body("email")
        .exists()
        .normalizeEmail()
        .isEmail(),
    body("username")
        .exists()
        .trim()
        .isLength({ min: 4 }),
    body("password")
        .exists()
        .isStrongPassword(STRONG_PW_OPTS),
    sendValidationErrors
], AuthController.register)

/**
 * Takes in an username and password.
 * Upon successful login, a cookie is set for future requests.
 */
authRouter.post("/login", [
    body("email")
        .exists()
        .trim(),
    body("password")
        .exists(),
    sendValidationErrors
], AuthController.login)

/**
 * Logs out the requester by removing their cookie.
 */
authRouter.post("/logout", AuthController.logout)

export default authRouter
