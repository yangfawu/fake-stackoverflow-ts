import "./alias-config"

import { DB_URI, PORT } from "@config/globals"
import "@model/config"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import apiRouter from "./api"
import { connect, disconnect } from "mongoose"
import defaultErrorHandler from "@middleware/default-error-handler"
import morgan from "morgan"

const app = express()
app.use(cors({
    origin: `http://localhost:3000`,
    credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan("dev"))
app.get("/", (_, res) => { res.sendStatus(200) })
app.use("/api", apiRouter)
app.use(defaultErrorHandler)

async function main() {
    try {
        // https://mongoosejs.com/docs/7.x/docs/migrating_to_6.html#no-more-deprecation-warning-options
        await connect(DB_URI)
    } catch (e) {
        console.error(`Error connecting to ${DB_URI}`, e)
        throw e
    }

    const server = app.listen(PORT, () => {
        console.log(`Server running at port ${PORT}!`)
    })

    process.on("SIGINT", async () => {
        await disconnect()
        server.close(() => {
            console.log("Server closed. Database instance disconnected")
        })
    })
}
main().catch(async err => {
    console.error(err)
    await disconnect()
})
