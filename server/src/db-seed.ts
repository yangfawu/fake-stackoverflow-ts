import "./alias-config"

import { DB_URI } from "@config/globals"
import { Role } from "@config/mongoose"
import { STRONG_PW_OPTS } from "@config/validator"
import Answer from "@model/answer"
import Comment from "@model/comment"
import "@model/config"
import { PostDocument } from "@model/post"
import Question from "@model/question"
import Tag from "@model/tag"
import User from "@model/user"
import Vote from "@model/vote"
import { hashSync } from "bcrypt"
import { random, sample, take, truncate } from "lodash"
import { connect, disconnect } from "mongoose"
import validator from "validator"
import isEmail from "validator/lib/isEmail"

function getAdminCredentials(argv: string[]) {
    if (argv.length != 2)
        throw new Error("Expected 2 arguments: [email] [password]")

    if (!isEmail(argv[0]))
        throw new Error("invalid email")

    const email = validator.normalizeEmail(argv[0])
    if (!email)
        throw new Error("cannot sanitize email")

    const password = argv[1]
    if (!validator.isStrongPassword(password, STRONG_PW_OPTS))
        throw new Error("password too weak")

    return {
        email,
        password
    }
}

const USERNAMES = [
    "johndoe",
    "maryjane",
    "doejane"
]
const SHORT_TEXTS = [
    "obfuscate",
    "ephemeral",
    "quixotic",
    "ineffable",
    "serendipity",
    "ebullient",
    "peregrinate",
    "nefarious",
    "pulchritudinous",
    "susurrus",
]
const LONG_TEXTS = [
    "Floc cin aucin ihil ipil ific ation",
    "Pne umon oult ramic roscop icsil ico vo lc ano con iosis",
    "Incom preh ensib iliti es",
    "Sup erca lifra gilis ticex pial idoc ious",
    "Disp ropo rtio nabl eness",
    "Se squi peda lian",
    "Llan fairp wllg wyn gyllg oge rych wyndr obwl llll antys iliogo gogo ch",
    "Hono rif icab ilitu dinit atibu s",
    "Ele ctro ence phal ograph ically",
    "Hip popo tomo nstr oses quip pedal iophobia",
    "Ant idis estab lishm entar ianism",
    "Floc ina ucin ihil ipil ific ate",
    "Sup erca lifra gilis ticex pial idoc ious ness",
    "Pseu dopse udo hypop arat hyro idis m",
    "Indi stin guis habl eness",
    "Sup erca lifra gilis ticex pial idoc ious",
    "Llan fairp wllg wyn gyllg oge rych wyndr obwl llll antys iliogo gogo ch",
    "Pne umon oult ramic roscop icsil ico vo lc ano con iosis",
    "Incom preh ensib iliti es",
    "Floc cin aucin ihil ipil ific ation",
    "Ele ctro ence phal ograph ically",
    "Ant idis estab lishm entar ianism",
    "Disp ropo rtio nabl eness",
    "Se squi peda lian",
    "Hono rif icab ilitu dinit atibu s",
    "Sup erca lifra gilis ticex pial idoc ious",
    "Hip popo tomo nstr oses quip pedal iophobia",
    "Floc ina ucin ihil ipil ific ate",
    "Pseu dopse udo hypop arat hyro idis m",
    "Llan fairp wllg wyn gyllg oge rych wyndr obwl llll antys iliogo gogo ch",
    "Indi stin guis habl eness",
    "Sup erca lifra gilis ticex pial idoc ious ness",
    "Disp ropo rtio nabl eness",
    "Ant idis estab lishm entar ianism",
    "Floc ina ucin ihil ipil ific ate",
    "Se squi peda lian",
    "Hono rif icab ilitu dinit atibu s",
    "Incom preh ensib iliti es",
    "Ele ctro ence phal ograph ically",
    "Hip popo tomo nstr oses quip pedal iophobia",
    "Pseu dopse udo hypop arat hyro idis m",
    "Llan fairp wllg wyn gyllg oge rych wyndr obwl llll antys iliogo gogo ch",
    "Sup erca lifra gilis ticex pial idoc ious",
]

async function main(argv: string[]) {
    const { email, password } = getAdminCredentials(argv)
    const password_hash = hashSync(password, 10)

    await connect(DB_URI)
    const admin = await User.create({
        name: "admin",
        email,
        password_hash,
        role: Role.ADMIN
    })
    console.log("created admin", admin.email, admin.name)

    const users = await Promise.all(
        USERNAMES.map(name => User.create({
            email: `${name}@example.com`,
            name,
            password_hash,
            role: Role.USER,
            reputation: random(100)
        }))
    )
    for (const u of users)
        console.log("created user", u.email, u.name)

    const tags = await Promise.all(
        SHORT_TEXTS.map(name => Tag.create({
            name,
            author: sample(users)
        }))
    )
    for (const t of tags)
        console.log("created tag", t.name)

    const posts: PostDocument[] = []

    // generate some questions
    while (LONG_TEXTS.length > 1) {
        const q = await Question.create({
            title: LONG_TEXTS.pop()!,
            text: LONG_TEXTS.pop()!,
            tags: take(tags, random(1, 4)),
            views: random(200),
            author: sample(users),
            votes: random(1000)
        })
        posts.push(q)

        // generate some answers for question
        for (let i=random(6); i>0 && LONG_TEXTS.length>0; i--) {
            const a = await Answer.create({
                author: sample(users),
                text: LONG_TEXTS.pop()!,
                votes: random(100),
                parent: q
            })
            posts.push(a)
            
            // generate some comments for answer
            for (let j=random(6); j>0 && LONG_TEXTS.length>0; j--) {
                posts.push(
                    await Comment.create({
                        author: sample(users),
                        text: LONG_TEXTS.pop()!,
                        votes: random(100),
                        parent: a
                    })
                )
            }
        }

        // generate some comments for the question
        for (let j=random(6); j>0 && LONG_TEXTS.length>0; j--) {
            const c = await Comment.create({
                author: sample(users),
                text: LONG_TEXTS.pop()!,
                votes: random(100),
                parent: q
            })
            posts.push(c)
        }

        console.log("added question", truncate(q.title, { length: 30 }))
    }

    // simulate some voting records on posts
    for (const user of users) {
        const posts_to_vote = take(posts, random(posts.length))
        await Promise.all(
            posts_to_vote.map(post => Vote.create({
                post,
                user,
                value: sample([-1, 1])
            }))
        )
    }

    await disconnect()
    console.log("done")
}
main(process.argv.slice(2))
    .catch(async err => {
        console.error(err)
        await disconnect()
    })
