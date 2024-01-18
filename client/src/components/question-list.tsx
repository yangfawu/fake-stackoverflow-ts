import { Box, Divider, Stack, Tooltip, Typography } from "@mui/material"
import pluralize from "pluralize"
import { Link } from "react-router-dom"
import TagList from "./tag-list"
import TimeAgo from "./time-ago"

interface Question {
    _id: string
    title: string
    text: string
    views: number
    tags: {
        _id: string
        name: string
    }[]
    author: {
        _id: string
        name: string
        role: string
        reputation: number
    }
    votes: number
    answers: number
    created_at: string
    updated_at: string
}
interface Props {
    data: Question[]
}
export default function QuestionList({ data }: Props) {


    return (
        <Stack spacing={1} divider={<Divider />}>
            {
                data.map(({ _id, title, text, answers, views, votes, tags, author, created_at }) => (
                    <Box key={_id} sx={{ py: 2, display: "flex", gap: 3 }}>
                        <Stack spacing={0} minWidth={75}>
                            <Typography variant="body2">{answers} {pluralize("answer", answers)}</Typography>
                            <Typography variant="body2">{views} {pluralize("view", views)}</Typography>
                            <Typography variant="body2">{votes} {pluralize("vote", votes)}</Typography>
                        </Stack>
                        <Stack spacing={1} flex={1}>
                            <Box>
                                <Typography variant="h5">
                                    <Link to={`/question/${_id}`}>{title}</Link>
                                </Typography>
                                <Typography variant="body2" noWrap>{text}</Typography>
                            </Box>
                            <TagList data={tags} />
                        </Stack>
                        <Box>
                            <Typography variant="body1">
                                <Tooltip arrow title={`${author.reputation} reputation`}>
                                    <span style={{ color: "red" }}>{author.name}</span>
                                </Tooltip>
                                {" "}asked <TimeAgo value={created_at} />
                            </Typography>
                        </Box>
                    </Box>
                ))
            }
        </Stack>
    )
}
