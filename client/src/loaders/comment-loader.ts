import { LoaderFunctionArgs, redirect } from "react-router-dom"
import api from "../api"

export default async function commentLoader({ request, params }: LoaderFunctionArgs) {
    console.log(params)
    
    const cid = params["cid"]
    if (!cid)
        return redirect("/home")

    try {
        const { data } = await api.get(`/comment/specific/${cid}`, {
            signal: request.signal
        })
        return data
    } catch (error) {
        console.log(error)
        return redirect("/home")
    }
}
