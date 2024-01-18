import { useRouteLoaderData } from 'react-router-dom'

interface Auth {
    expires_at: string
    name: string
    role: string
}

export default function useAuth() {
    const data = useRouteLoaderData("root") as Auth
    return data
}
