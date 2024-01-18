import { z } from "zod"
import api from "./api"

interface Auth {
    expires_at: string
    name: string
    role: string
    value: string
}

interface LoginResponse {
    success: boolean
    data: Auth
}

interface AuthProvider {
    isAuthenticated: boolean
    name: string | null
    role: string | null
    login(email: string, password: string): Promise<void>
    logout(): Promise<void>
}

const schema = z.object({
    expires_at: z.coerce.date(),
    name: z.string()
        .trim()
        .min(1),
    role: z.enum(["user", "admin"]),
    value: z.string()
        .trim()
        .min(1)
})

function createProvider() {
    let isAuthenticated = false
    let name = null
    let role = null

    const localAuth = localStorage.getItem("auth")
    if (localAuth) {
        try {
            const data = JSON.parse(localAuth)
            const result = schema.parse(data)
            if (result.expires_at.getTime() > Date.now()) {
                isAuthenticated = true
                name = result.name
                role = result.role
            }
        } catch (e) {
            console.error(e)
        }
    }

    const provider: AuthProvider = {
        isAuthenticated,
        name,
        role,
        async login(email, password) {
            const payload = { email, password }
            const { data } = await api.post("/auth/login", payload)

            const { data: auth } = data as LoginResponse
            localStorage.setItem("auth", JSON.stringify(auth))
            provider.isAuthenticated = true
            provider.name = auth.name
            provider.role = auth.role
        },
        async logout() {
            // optimistically assume logout success
            localStorage.removeItem("auth")
            provider.isAuthenticated = false
            provider.name = null
            provider.role = null

            await api.post("/auth/logout")
        }
    }
    return provider
}

const authProvider = createProvider()
export default authProvider
