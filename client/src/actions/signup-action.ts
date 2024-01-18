import axios from "axios"
import { LoaderFunctionArgs, redirect } from "react-router-dom"
import api from "../api"

export default async function signupAction({ request }: LoaderFunctionArgs) {
    const formData = await request.formData()

    const email = formData.get("email") as string | null
    if (!email)
        return { error: "email is missing" }

    const name = formData.get("name") as string | null
    if (!name)
        return { error: "username is missing" }

    const password = formData.get("password") as string | null
    if (!password)
        return { error: "password is missing" }

    try {
        const payload = {
            email,
            username: name,
            password
        }
        await api.post("/auth/register", payload, {
            signal: request.signal
        })

        return redirect("/login")
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const { data } = error.response
            switch (data?.type) {
                case "ExpressValidatorError":
                    return { error: `inputs failed validation: ${Object.keys(data.errors).join(", ")}` }
                case "ServerValidationError":
                    return { error: Object.values(data.errors).join("; ") }
                default:
                    console.error(error)
                    return { error: "unknown register error" }
            }
        }
        console.error(error)
        return { error: "unknown register error" }
    }
}
