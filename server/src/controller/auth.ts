import { JWT_ALGO, PRIVATE_KEY } from "@config/jwt"
import { Role } from "@config/mongoose"
import { UnauthorizedError } from "@error/auth"
import { ServerValidationError } from "@error/validation"
import User from "@model/user"
import { compareSync, hashSync } from "bcrypt"
import type { NextFunction, Request, Response } from "express"
import { sign } from "jsonwebtoken"

async function register(req: Request, res: Response, next: NextFunction) {
    const email = String(req.body.email)
    const name = String(req.body.username)

    const existingUser = await User.findOne({
        $or: [
            { email },
            { name }
        ]
    }).exec()
    if (existingUser) {
        const errors = {}
        if (existingUser.email === email) {
            Object.assign(errors, {
                email: "email already taken"
            })
        }
        if (existingUser.name === name) {
            Object.assign(errors, {
                username: "user name already taken"
            })
        }

        return next(new ServerValidationError(errors)) 
    }

    const password = String(req.body.password)
    const password_hash = hashSync(password, 10)
    const newUser = await User.create({
        email,
        name,
        password_hash,
        role: Role.USER
    })
    
    res.send({
        success: true,
        message: "account created",
        data: {
            username: newUser.name,
            email: newUser.email
        }
    })
}

async function login(req: Request, res: Response, next: NextFunction) {
    const email = String(req.body.email)
    const password = String(req.body.password)

    const user = await User.findOne({ email }).exec()
    if (!user || !compareSync(password, user.password_hash))
        return next(new UnauthorizedError("invalid user name or password"))

    const { _id: uid } = user
    const token = sign({ uid }, PRIVATE_KEY, {
        algorithm: JWT_ALGO,
        expiresIn: "1h"
    })

    const expiration = 1 * 60 * 60 * 1000 // 1h
    const payload = {
        value: token,
        name: user.name,
        role: user.role,
        expires_at: new Date(Date.now() + expiration)
    }

    res.cookie("token", JSON.stringify(payload), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: expiration
    })
    res.send({
        success: true,
        data: payload
    })
}

function logout(_: Request, res: Response) {
    res.clearCookie("token")
    res.send({
        success: true,
        message: "logged out"
    })
}

const AuthController = {
    register,
    login,
    logout
}
export default AuthController
