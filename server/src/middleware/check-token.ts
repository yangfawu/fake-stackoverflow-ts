import { JWT_ALGO, PUBLIC_KEY } from "@config/jwt"
import { UnauthorizedError } from "@error/auth"
import User from "@model/user"
import type { NextFunction, Request, Response } from "express"
import { verify } from "jsonwebtoken"

export default async function checkToken(req: Request, res: Response, next: NextFunction) {
    const { token } = req.cookies
    if (!token)
        return next(new UnauthorizedError("missing token"))

    try {
        const { value } = JSON.parse(token)

        // @ts-ignore
        const { uid } = verify(value, PUBLIC_KEY, {
            algorithms: [JWT_ALGO]
        })
        
        const user = await User.findById(uid)
            .orFail(new Error())
            .exec()
        res.locals.uid = user._id
        res.locals.user = user
        next()
    } catch (e) {
        next(new UnauthorizedError("invalid token"))
    }
}
