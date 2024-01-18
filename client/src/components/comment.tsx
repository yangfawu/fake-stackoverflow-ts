import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material"
import pluralize from "pluralize"
import { useNavigate } from "react-router-dom"
import api from "../api"
import useAuth from "../hooks/use-auth"
import useVote from "../hooks/use-vote"
import HyperlinkView from "./hyperlink-view"
import TimeAgo from "./time-ago"

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
export default function Comment({ data }: Props) {
    const navigate = useNavigate()
    const { _id, votes, text, author, created_at } = data
    const { userVote, undovotePost, upvotePost } = useVote(_id, votes)
    const { name, role } = useAuth()

    const goToEdit = () => {
        navigate(`/edit-comment/${_id}`)
    }

    const deleteComment = async () => {
        try {
            await api.delete(`/comment/${_id}`)
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
                {
                    name !== null &&
                    <>
                        <Chip variant="outlined" size="small" label="upvote" onClick={upvotePost} />
                        <Chip variant="outlined" size="small" label="undo vote" onClick={undovotePost} />
                    </>
                }
                {
                    (author.name === name || role === "admin") &&
                    <>
                        <Chip variant="outlined" size="small" label="edit" onClick={goToEdit} />
                        <Chip variant="outlined" size="small" label="delete" onClick={deleteComment} />
                    </>
                }
            </Box>
        </Stack>
    )
}
