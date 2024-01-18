import { LoaderFunctionArgs, redirect } from "react-router-dom"
import authProvider from "../auth"

export default function protectedLoader({ request }: LoaderFunctionArgs) {
    const params = new URLSearchParams()
    params.set("from", new URL(request.url).pathname)

    if (authProvider.isAuthenticated)
        return null

    return redirect("/login?" + params.toString())
}
