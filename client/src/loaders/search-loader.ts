import { LoaderFunctionArgs } from "react-router-dom"
import api from "../api"

export default async function searchLoader({ request }: LoaderFunctionArgs) {
    const search = new URL(request.url).searchParams
    const query = (search.get("q") || "").trim()
    const page = Number(search.get("p")) || 1
    const mode = (search.get("m") || "newest").trim()

    const params = new URLSearchParams()
    params.set("query", query)
    params.set("mode", mode)
    params.set("page", String(page))
    params.set("size", String(5))

    const res = await api.get(`/question/all?${params.toString()}`, {
        signal: request.signal
    })
    return {
        ...res.data,
        query,
        mode
    }
}
