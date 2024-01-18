import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom"
import loginAction from "./actions/login-action"
import newAnswerAction from "./actions/new-answer-action"
import newCommentAction from "./actions/new-comment-action"
import newQuestionAction from "./actions/new-question-action"
import signupAction from "./actions/signup-action"
import updateAnswerAction from "./actions/update-answer-action"
import updateCommentAction from "./actions/update-comment-action"
import updateQuestionAction from "./actions/update-question-action"
import RootLayout from "./layouts/root-layout"
import answerLoader from "./loaders/answer-loader"
import protectedLoader from "./loaders/protected-loader"
import questionLoader from "./loaders/question-loader"
import rootLoader from "./loaders/root-loader"
import searchLoader from "./loaders/search-loader"
import tagsLoader from "./loaders/tags-loader"
import Account from "./pages/account"
import Comments from "./pages/comments"
import EditAnswer from "./pages/edit-answer"
import EditComment from "./pages/edit-comment"
import EditQuestion from "./pages/edit-question"
import Login from "./pages/login"
import NewAnswer from "./pages/new-answer"
import NewComment from "./pages/new-comment"
import NewQuestion from "./pages/new-question"
import Question from "./pages/question"
import Search from "./pages/search"
import SignUp from "./pages/sign-up"
import Tags from "./pages/tags"
import commentsLoader from "./loaders/comments-loader"
import commentLoader from "./loaders/comment-loader"

const router = createBrowserRouter([
    {
        id: "root",
        path: "/",
        loader: rootLoader,
        Component: RootLayout,
        children: [
            {
                path: "",
                Component: () => <Navigate to="/account" replace />
            },
            {
                path: "login",
                action: loginAction,
                Component: Login,
            },
            {
                path: "signup",
                action: signupAction,
                Component: SignUp,
            },
            {
                path: "account",
                loader: protectedLoader,
                Component: Account,
            },
            {
                path: "home",
                loader: searchLoader,
                Component: Search,
            },
            {
                path: "tags",
                loader: tagsLoader,
                Component: Tags,
            },
            {
                path: "question/:id",
                loader: questionLoader,
                Component: Question,
            },
            {
                path: "edit-question/:id",
                loader: questionLoader,
                action: updateQuestionAction,
                Component: EditQuestion,
            },
            {
                path: "new-question",
                action: newQuestionAction,
                Component: NewQuestion,
            },
            {
                path: "new-answer/:qid",
                action: newAnswerAction,
                Component: NewAnswer,
            },
            {
                path: "edit-answer/:aid",
                loader: answerLoader,
                action: updateAnswerAction,
                Component: EditAnswer,
            },
            {
                path: "comments/:pid",
                loader: commentsLoader,
                Component: Comments,
            },
            {
                path: "new-comment/:pid",
                action: newCommentAction,
                Component: NewComment,
            },
            {
                path: "edit-comment/:cid",
                loader: commentLoader,
                action: updateCommentAction,
                Component: EditComment
            }
        ]
    }
])

export default function App() {
    return <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />
}
