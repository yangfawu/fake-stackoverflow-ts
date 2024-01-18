import { ForbiddenError, UnauthorizedError } from "@error/auth"
import { MissingResourceError } from "@error/resource"
import { ExpressValidatorError, ServerValidationError } from "@error/validation"
import type { NextFunction, Request, Response } from "express"

export default async function defaultErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (res.headersSent)
        return next(err)

    switch (err.constructor) {
        case UnauthorizedError:
            return res.status(401).send({
                success: false,
                type: "UnauthorizedError",
                message: (err as UnauthorizedError).message
            })
        case ForbiddenError:
            return res.status(403).send({
                success: false,
                type: "ForbiddenError",
                message: (err as ForbiddenError).message
            })
        case MissingResourceError:
            return res.status(404).send({
                success: false,
                type: "MissingResourceError",
                message: (err as MissingResourceError).message
            })
        case ExpressValidatorError:
            return res.status(400).send({
                success: false,
                type: "ExpressValidatorError",
                errors: (err as ExpressValidatorError).validation_payload
            })
        case ServerValidationError:
            return res.status(400).send({
                success: false,
                type: "ServerValidationError",
                errors: (err as ServerValidationError).validation_payload
            })
        default:
            break
    }
    next(err)
}
