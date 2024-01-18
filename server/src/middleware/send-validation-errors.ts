import { ExpressValidatorError } from "@error/validation"
import type { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"

export default function sendValidationErrors(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    if (errors.isEmpty())
        return next()

    next(new ExpressValidatorError(errors.mapped()))
}
