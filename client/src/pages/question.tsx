import { Alert, Box, Button, Chip, Divider, Stack, Tooltip, Typography } from "@mui/material"
import pluralize from "pluralize"
import { useLoaderData, useNavigate } from "react-router-dom"
import api from "../api"
import AnswerList from "../components/answer-list"
import HyperlinkView from "../components/hyperlink-view"
import TagList from "../components/tag-list"
import TimeAgo from "../components/time-ago"
import useAuth from "../hooks/use-auth"
import useVote from "../hooks/use-vote"

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

interface Data {
    success: boolean
    data: Post & {
        title: string
        views: number
        tags: {
            _id: string
            name: string
        }[]
        answers: Post[]
    }
}

export default function Question() {
    const navigate = useNavigate()
    const { success, data } = useLoaderData() as Data
    const { userVote, downvotePost, undovotePost, upvotePost } = useVote(data._id, data.votes)
    const { name, role } = useAuth()

    if (!success) {
        return (
            <Box sx={{ py: 2 }}>
                <Alert severity="error">question not found</Alert>
            </Box>
        )
    }

    const {
        _id,
        title,
        tags,
        text,
        author,
        created_at,
        answers,
        views,
        votes,
    } = data

    const goToComments = () => {
        window.open(`/comments/${_id}`, "_blank", "rel=noopener noreferrer")
    }

    const goToEdit = () => {
        navigate(`/edit-question/${_id}`)
    }

    const deleteQuestion = async () => {
        try {
            await api.delete(`/question/${_id}`)
            navigate("/home")
        } catch (e) {
            console.error(e)
            window.alert("cannot delete")
        }
    }

    const goPostAnswer = () => {
        window.open(`/new-answer/${_id}`, "_blank", "rel=noopener noreferrer")
    }

    return (
        <Stack spacing={3} sx={{ py: 4 }}>
            <Box sx={{ display: "flex", gap: 3 }}>
                <Stack spacing={3} flex={1}>
                    <Stack spacing={1}>
                        <Typography variant="h4">{title}</Typography>
                        <TagList data={tags} />
                        <Typography variant="body1">
                            <Tooltip arrow title={`${author.reputation} reputation`}>
                                <span style={{ color: "red" }}>{author.name}</span>
                            </Tooltip>
                            {" "}asked <TimeAgo value={created_at} />
                        </Typography>
                    </Stack>
                </Stack>
                <Stack spacing={0} minWidth={75}>
                    <Typography variant="body2">{answers.length} {pluralize("answer", answers.length)}</Typography>
                    <Typography variant="body2">{views} {pluralize("view", views)}</Typography>
                    <Typography variant="body2">{userVote} {pluralize("vote", userVote)}</Typography>
                </Stack>
            </Box>
            <Typography variant="h6">
                <HyperlinkView value={text} />
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "right" }}>
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
                        <Chip variant="outlined" size="small" label="delete" onClick={deleteQuestion} />
                    </>
                }
            </Box>
            <Divider />
            <AnswerList data={answers} />
            <Box sx={{ display: "flex", justifyContent: "right" }}>
                <Button variant="outlined" onClick={goPostAnswer}>
                    Post Answer
                </Button>
            </Box>
        </Stack>
    )
}
