import { Alert, Box, Button, Divider, Stack, Typography } from "@mui/material"
import { useMemo, useState } from "react"
import Answer from "./answer"

interface Post {
    _id: string
    text: string
    author: {
        _id: string
        name: string
        role: string
        reputation: number
    }
    votes: number
    created_at: string
    updated_at: string
}

interface Props {
    data: Post[]
}
export default function AnswerList({ data }: Props) {
    const [page, setPage] = useState(1)
    const totalPages = useMemo(() => Math.max(1, Math.ceil(data.length / 5)), [data])

    const goToPrevPage = () => {
        if (page == 1)
            return
        setPage(prev => prev - 1)
    }

    const goToNextPage = () => {
        if (page == totalPages)
            return
        setPage(prev => prev + 1)
    }

    const window = useMemo(() => {
        const start = (page - 1) * 5
        return data.slice(start, start + 5)
    }, [page, data])

    return (
        <>
            <Stack spacing={1} divider={<Divider />}>
                {
                    window.length < 1 &&
                    <Alert severity="info">no answers</Alert>
                }
                {
                    window.map(props => (
                        <Answer key={props._id} data={props} />
                    ))
                }
            </Stack>
            <Divider />
            <Box>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Button variant="outlined" disabled={page == 1} onClick={goToPrevPage}>
                        Back
                    </Button>
                    <Button variant="outlined" disabled={page == totalPages} onClick={goToNextPage}>
                        Next
                    </Button>
                </Box>
                <Typography variant="body2" marginTop={1}>
                    Currently on page {page} of {totalPages}
                </Typography>
            </Box>
        </>
    )
}
