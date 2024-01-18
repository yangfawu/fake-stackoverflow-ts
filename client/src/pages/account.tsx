import { Box, Button, Chip, Stack, Typography } from "@mui/material"
import authProvider from "../auth"
import useAuth from "../hooks/use-auth"

export default function Account() {
    const { name, role } = useAuth()

    const logout = async () => {
        await authProvider.logout()
        window.location.reload()
    }

    // TODO
    // display profile information

    return (
        <Stack spacing={3} sx={{ py: 4 }}>
            <Stack spacing={1}>
                <Typography variant="h4">{name}'s Account</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    <Chip label={role} />
                </Box>
            </Stack>
            <Box>
                <Button variant="outlined" onClick={logout}>Log Out</Button>
            </Box>
        </Stack>
    )
}
