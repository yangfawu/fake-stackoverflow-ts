import { Alert, Box, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material"
import pluralize from "pluralize"
import { Link, createSearchParams, useLoaderData } from "react-router-dom"

interface Data {
    success: boolean
    data: {
        _id: string
        count: number
        name: string
    }[]
}

export default function Tags() {
    const { success, data } = useLoaderData() as Data

    if (!success) {
        return (
            <Box sx={{ py: 2 }}>
                <Alert severity="error">no tags found</Alert>
            </Box>
        )
    }

    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4">Tags</Typography>
            <List>
                {
                    data.map(({ _id, name, count }, i) => (
                        <ListItem key={_id} disableGutters disablePadding>
                            <ListItemButton component={Link} to={{
                                pathname: "/home",
                                search: `?${createSearchParams({ q: `[${name}]` })}`
                            }}>
                                <ListItemText primary={`${i + 1}. ${name} [${count} ${pluralize("question", count)}]`} />
                            </ListItemButton>
                        </ListItem>
                    ))
                }
            </List>
        </Box>
    )
}
