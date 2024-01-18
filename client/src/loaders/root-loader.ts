import authProvider from "../auth"

export default async function rootLoader() {
    const { isAuthenticated, name, role } = authProvider
    return { isAuthenticated, name, role }
}
