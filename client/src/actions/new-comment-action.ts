import axios from "axios"
import { LoaderFunctionArgs, redirect } from "react-router-dom"
import api from "../api"

export default async function newCommentAction({ request, params }: LoaderFunctionArgs) {
    const formData = await request.formData()
    const text = formData.get("text") as string | null
    if (!text)
        return { error: "text is missing" }

    const pid = params["pid"]

    try {
        const payload = {
            pid,
            text
        }
        const res = await api.post("/comment/new", payload, {
            signal: request.signal,
        })
        const { data: { success, message } } = res
        if (!success)
            return { error: message }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                const { data: { message } } = error.response
                return { error: message }
            }
        }
        console.log(error)
        return { error: "posting new answer failed" }
    }

    return redirect(`/home`)
}
