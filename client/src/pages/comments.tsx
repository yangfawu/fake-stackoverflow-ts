import { Alert, Box, Button, Divider, Stack, Typography } from "@mui/material"
import { useLoaderData, useNavigate, useParams } from "react-router-dom"
import Comment from "../components/comment"

interface Data {
    success: boolean
    data: {
        docs: any[]
        totalDocs: number
        page: number
        totalPages: number
        hasPrevPage: boolean
        hasNextPage: boolean
        prevPage: number
        nextPage: number
    }
}
export default function Comments() {
    const navigate = useNavigate()
    const params = useParams()
    const { success, data } = useLoaderData() as Data

    if (!success) {
        return (
            <Box sx={{ py: 2 }}>
                <Alert severity="error">no comments found</Alert>
            </Box>
        )
    }

    const { docs, hasNextPage, hasPrevPage, prevPage, nextPage, page, totalDocs, totalPages } = data

    const goToPrevPage = () => {
        if (!hasPrevPage)
            return

        const pid = params["pid"]
        const outParams = new URLSearchParams()
        outParams.set("p", String(prevPage))
        navigate(`/comments/${pid}?${outParams.toString()}`)
    }

    const goToNextPage = () => {
        if (!hasNextPage)
            return

        const pid = params["pid"]
        const outParams = new URLSearchParams()
        outParams.set("p", String(nextPage))
        navigate(`/comments/${pid}?${outParams.toString()}`)
    }

    const goPostComment = () => {
        window.open(`/new-comment/${params["pid"]}`, "_blank", "rel=noopener noreferrer")
    }

    return (
        <Stack spacing={3} sx={{ py: 4 }}>
            <Stack spacing={1}>
                <Typography variant="h4">Comments</Typography>
                <Box>
                    <Typography variant="body1">
                        <b>Page</b>: {page}
                    </Typography>
                    <Typography variant="body1">
                        <b>Total</b>: {totalDocs}
                    </Typography>
                </Box>
            </Stack>
            <Stack spacing={1} divider={<Divider />}>
                {
                    docs.length < 1 &&
                    <Alert severity="info">no comments</Alert>
                }
                {
                    docs.map(props => (
                        <Comment key={props._id} data={props} />
                    ))
                }
            </Stack>
            <Box>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Button variant="outlined" disabled={!hasPrevPage} onClick={goToPrevPage}>
                        Back
                    </Button>
                    <Button variant="outlined" disabled={!hasNextPage} onClick={goToNextPage}>
                        Next
                    </Button>
                </Box>
                <Typography variant="body2" marginTop={1}>
                    Currently on page {page} of {totalPages}
                </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "right" }}>
                <Button variant="outlined" onClick={goPostComment}>
                    Post Comment
                </Button>
            </Box>
        </Stack>
    )
}
