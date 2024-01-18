import { LoaderFunctionArgs } from "react-router-dom"
import api from "../api"

export default async function commentsLoader({ request, params }: LoaderFunctionArgs) {
    const search = new URL(request.url).searchParams
    const page = Number(search.get("p")) || 1

    const pid = params["pid"]

    const outParams = new URLSearchParams()
    outParams.set("page", String(page))
    outParams.set("size", String(5))

    const res = await api.get(`/comment/${pid}?${outParams.toString()}`, {
        signal: request.signal
    })
    return res.data
}
