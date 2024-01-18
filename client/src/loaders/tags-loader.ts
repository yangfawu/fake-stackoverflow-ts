import { LoaderFunctionArgs } from "react-router-dom"
import api from "../api"

export default async function tagsLoader({ request }: LoaderFunctionArgs) {
    const res = await api.get("/tag/all", {
        signal: request.signal
    })
    return res.data
}
