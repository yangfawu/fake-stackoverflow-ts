import { Role } from "@config/mongoose"
import { ForbiddenError } from "@error/auth"
import User, { UserDocument } from "@model/user"
import type { NextFunction, Request, Response } from "express"

export default async function checkAdmin(_: Request, res: Response, next: NextFunction) {
    const user: UserDocument = res.locals.user
    if (user.role !== Role.ADMIN)
        return next(new ForbiddenError("not an admin")) 

    next()
}
