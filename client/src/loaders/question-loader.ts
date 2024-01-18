import { LoaderFunctionArgs, redirect } from "react-router-dom"
import api from "../api"

export default async function questionLoader({ request, params }: LoaderFunctionArgs) {
    const qid = params["id"]
    if (!qid)
        return redirect("/home")

    try {
        const { data } = await api.get(`/question/${qid}`, {
            signal: request.signal
        })
        return data
    } catch (error) {
        console.log(error)
        return redirect("/home")
    }
}
