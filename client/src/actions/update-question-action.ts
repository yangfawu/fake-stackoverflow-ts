import axios from "axios"
import { LoaderFunctionArgs, redirect } from "react-router-dom"
import api from "../api"

export default async function updateQuestionAction({ request }: LoaderFunctionArgs) {
    const formData = await request.formData()

    const title = formData.get("title") as string | null
    if (!title)
        return { error: "title is missing" }

    const text = formData.get("text") as string | null
    if (!text)
        return { error: "text is missing" }

    const tags = formData.get("tags") as string | null
    if (!tags)
        return { error: "tags is missing" }

    const qid = formData.get("_id") as string | null

    try {
        const payload = {
            title,
            text,
            tags,
        }

        if (qid) {
            const res = await api.post(`/question/${qid}`, payload, {
                signal: request.signal
            })
            const { data: { success, message } } = res
            if (!success)
                return { error: message }
        } else {
            const res = await api.post("/question/new", payload, {
                signal: request.signal
            })
            const { data: { success, message } } = res
            if (!success)
                return { error: message }
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                const { data: { message } } = error.response
                return { error: message }
            }
        }
        console.log(error)
        return { error: "editting question failed" }
    }

    return redirect("/home")
}
