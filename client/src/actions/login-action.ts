import { LoaderFunctionArgs, redirect } from "react-router-dom"
import authProvider from "../auth"
import axios from "axios"

export default async function loginAction({ request }: LoaderFunctionArgs) {
    const formData = await request.formData()

    const email = formData.get("email") as string | null
    if (!email)
        return { error: "email is missing" }

    const password = formData.get("password") as string | null
    if (!password)
        return { error: "password is missing" }

    try {
        await authProvider.login(email, password)

        const redirectTo = formData.get("from") as string | null
        return redirect(redirectTo || "/home")
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const { data } = error.response
            return { error: data?.message || "" }
        }
        console.error(error)
        return { error: "unknown login error" }
    }
}
