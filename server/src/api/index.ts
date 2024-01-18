import { Router } from "express"
import answerRouter from "./answer"
import authRouter from "./auth"
import commentRouter from "./comment"
import questionRouter from "./question"
import tagRouter from "./tag"
import userRouter from "./user"
import voteRouter from "./vote"

const apiRouter = Router()
apiRouter.use("/auth", authRouter)
apiRouter.use("/answer", answerRouter)
apiRouter.use("/comment", commentRouter)
apiRouter.use("/question", questionRouter)
apiRouter.use("/tag", tagRouter)
apiRouter.use("/user", userRouter)
apiRouter.use("/vote", voteRouter)

export default apiRouter
