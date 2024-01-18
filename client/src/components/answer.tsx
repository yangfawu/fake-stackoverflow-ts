import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material"
import pluralize from "pluralize"
import { useNavigate } from "react-router-dom"
import api from "../api"
import useVote from "../hooks/use-vote"
import HyperlinkView from "./hyperlink-view"
import TimeAgo from "./time-ago"
import useAuth from "../hooks/use-auth"

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
    data: Post
}
export default function Answer({ data }: Props) {
    const navigate = useNavigate()
    const { _id, votes, text, author, created_at } = data
    const { userVote, downvotePost, upvotePost, undovotePost } = useVote(_id, votes)
    const { name, role } = useAuth()

    const goToComments = () => {
        window.open(`/comments/${_id}`, "_blank", "rel=noopener noreferrer")
    }

    const goToEdit = () => {
        navigate(`/edit-answer/${_id}`)
    }

    const deleteAnswer = async () => {
        try {
            await api.delete(`/answer/${_id}`)
            window.location.reload()
        } catch (e) {
            console.error(e)
            window.alert("cannot delete")
        }
    }

    return (
        <Stack spacing={1}>
            <Box sx={{ py: 2, display: "flex", gap: 3 }}>
                <Stack spacing={0} minWidth={75}>
                    <Typography variant="body2">{userVote} {pluralize("vote", userVote)}</Typography>
                </Stack>
                <Stack spacing={1} flex={1}>
                    <Typography variant="body1">
                        <HyperlinkView value={text} />
                    </Typography>
                </Stack>
                <Stack spacing={0} minWidth={100}>
                    <Typography variant="body1">
                        <Tooltip arrow title={`${author.reputation} reputation`}>
                            <span style={{ color: "green" }}>{author.name}</span>
                        </Tooltip>
                    </Typography>
                    <Typography variant="body1">
                        answered <TimeAgo value={created_at} />
                    </Typography>
                </Stack>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "right", pb: 1 }}>
                <Chip variant="outlined" size="small" label="show comments" onClick={goToComments} />
                {
                    name !== null &&
                    <>
                        <Chip variant="outlined" size="small" label="upvote" onClick={upvotePost} />
                        <Chip variant="outlined" size="small" label="undo vote" onClick={undovotePost} />
                        <Chip variant="outlined" size="small" label="downvote" onClick={downvotePost} />
                    </>
                }
                {
                    (author.name === name || role === "admin") &&
                    <>
                        <Chip variant="outlined" size="small" label="edit" onClick={goToEdit} />
                        <Chip variant="outlined" size="small" label="delete" onClick={deleteAnswer} />
                    </>
                }
            </Box>
        </Stack>
    )
}
