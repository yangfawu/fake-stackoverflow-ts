import { Box, CssBaseline, Divider, Typography } from "@mui/material"
import { Link, Outlet } from "react-router-dom"
import useAuth from "../hooks/use-auth"

export default function RootLayout() {
    const { name } = useAuth()

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", alignItems: "center", mx: 2 }}>
            <CssBaseline />
            <Box sx={{ width: "100%", maxWidth: "900px" }}>
                <Box component="nav" sx={{ py: 3, display: "flex", gap: 2, alignItems: "center" }}>
                    <Typography variant="h6">Fake Stackoverflow</Typography>
                    <Box flex={1} />
                    <Link to="/home">
                        <Typography variant="body1">Questions</Typography>
                    </Link>
                    {
                        name !== null &&
                        <Link to="/new-question">
                            <Typography variant="body1">New Question</Typography>
                        </Link>
                    }
                    <Link to="/tags">
                        <Typography variant="body1">Tags</Typography>
                    </Link>
                    <Link to="/account">
                        <Typography variant="body1">Account</Typography>
                    </Link>
                </Box>
                <Divider flexItem />
            </Box>
            <Box component="main" sx={{ flex: 1, width: "100%", maxWidth: "900px" }}>
                <Outlet />
            </Box>
        </Box>
    )
}
