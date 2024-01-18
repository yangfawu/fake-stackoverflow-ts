declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string
            DB_URI: string
        }
    }
}
export {}
