import { LoaderFunctionArgs, redirect } from "react-router-dom"
import api from "../api"

export default async function answerLoader({ request, params }: LoaderFunctionArgs) {
    const aid = params["aid"]
    if (!aid)
        return redirect("/home")

    try {
        const { data } = await api.get(`/answer/${aid}`, {
            signal: request.signal
        })
        return data
    } catch (error) {
        console.log(error)
        return redirect("/home")
    }
}
