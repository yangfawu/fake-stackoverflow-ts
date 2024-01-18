import "./alias-config"

import { DB_URI } from "@config/globals"
import { createConnection } from "mongoose"

async function main() {
    const connection = createConnection(DB_URI)
    try {
        await connection.dropDatabase()
    } catch (e) {
        console.error(e)
    } finally {
        await connection.close()
        console.log("database reset")
    }
}
main().catch(console.error)
