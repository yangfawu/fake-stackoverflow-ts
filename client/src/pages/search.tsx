import { Alert, Box, Button, ButtonGroup, Divider, FormControl, FormHelperText, InputLabel, OutlinedInput, Stack, Typography } from "@mui/material"
import capitalize from "capitalize"
import pluralize from "pluralize"
import { KeyboardEventHandler, useEffect, useState } from "react"
import { useLoaderData, useNavigate } from "react-router-dom"
import QuestionList from "../components/question-list"

interface Data {
    success: boolean
    query: string
    mode: string
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

const MODES = ["newest", "active", "unanswered"]

export default function Search() {
    const navigate = useNavigate()
    const { success, query, mode, data } = useLoaderData() as Data
    const [input, setInput] = useState(query)

    useEffect(() => {
        setInput(query)
    }, [query])

    if (!success) {
        return (
            <Box sx={{ py: 2 }}>
                <Alert severity="error">no questions found</Alert>
            </Box>
        )
    }

    const { docs, hasNextPage, hasPrevPage, prevPage, nextPage, page, totalDocs, totalPages } = data

    const switchModes = (newMode: string) => {
        const params = new URLSearchParams()
        params.set("q", query)
        params.set("m", newMode)
        navigate(`/home?${params.toString()}`)
    }

    const submitNewQuery: KeyboardEventHandler<HTMLInputElement> = (event) => {
        if (event.code !== "Enter")
            return
        const params = new URLSearchParams()
        params.set("q", input)
        navigate(`/home?${params.toString()}`)
    }

    const goToPrevPage = () => {
        if (!hasPrevPage)
            return

        const params = new URLSearchParams()
        params.set("q", query)
        params.set("m", mode)
        params.set("p", String(prevPage))
        navigate(`/home?${params.toString()}`)
    }

    const goToNextPage = () => {
        if (!hasNextPage)
            return

        const params = new URLSearchParams()
        params.set("q", query)
        params.set("m", mode)
        params.set("p", String(nextPage))
        navigate(`/home?${params.toString()}`)
    }

    return (
        <Stack spacing={3} sx={{ py: 4 }}>
            <Stack spacing={1}>
                <Typography variant="h4">
                    {
                        query.length > 0 ?
                            "Search Results" :
                            "Questions"
                    }
                </Typography>
                <Box>
                    <Typography variant="body1">
                        <b>Page</b>: {page}
                    </Typography>
                    <Typography variant="body1">
                        <b>Total</b>: {totalDocs} {pluralize("question", totalDocs)}
                    </Typography>
                    <Typography variant="body1">
                        <b>Mode</b>: {mode}
                    </Typography>
                </Box>
            </Stack>
            <FormControl>
                <InputLabel htmlFor="search">Search</InputLabel>
                <OutlinedInput
                    id="search"
                    label="Search"
                    type="text"
                    value={input}
                    onChange={event => setInput(event.target.value)}
                    onKeyUp={submitNewQuery}
                />
                <FormHelperText>Press Enter to submit a new search</FormHelperText>
            </FormControl>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "right", gap: 1 }}>
                <ButtonGroup variant="outlined" size="small">
                    {
                        MODES.map(m => (
                            <Button key={m}
                                variant={mode === m ? "contained" : "outlined"}
                                onClick={() => switchModes(m)}>
                                {capitalize(m)}
                            </Button>
                        ))
                    }
                </ButtonGroup>
            </Box>
            {
                docs.length < 1 ?
                    <Alert severity="info">No questions found. Try another search.</Alert> :
                    <QuestionList data={docs} />
            }
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
        </Stack>
    )
}
