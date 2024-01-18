import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, Box, Button, Stack, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import { useActionData, useSubmit } from "react-router-dom"
import { z } from "zod"
import ControlledInput from "../components/controlled-input"
import { findLinkIssues } from "../util"

const schema = z.object({
    title: z.string()
        .trim()
        .min(1, "title is required")
        .max(50, "cannot exceed 50 characters"),
    text: z.string()
        .trim()
        .min(1, "text is required")
        .max(140, "cannot exceed 140 characters"),
    tags: z.string()
        .trim()
        .min(1, "tags are required"),
})

type FormSchemaType = z.infer<typeof schema>

export default function NewQuestion() {
    const routerSubmit = useSubmit()
    const { control, handleSubmit, setError } = useForm<FormSchemaType>({
        defaultValues: {
            title: "",
            text: "",
            tags: ""
        },
        resolver: zodResolver(schema),
        mode: "all"
    })

    const actionData = useActionData() as { error: string } | undefined

    const submit = handleSubmit(values => {
        const message = findLinkIssues(values.text)
        if (message) {
            setError("text", { message })
            return
        }
        routerSubmit(values, {
            action: "/new-question",
            method: "POST"
        })
    })

    return (
        <Stack spacing={3} sx={{ py: 4 }}>
            <Typography variant="h4">New Question</Typography>
            <Stack spacing={3} maxWidth={500}>
                {
                    actionData?.error &&
                    <Alert severity="error">{actionData.error}</Alert>
                }
                <ControlledInput
                    control={control}
                    name="title"
                    label="Question Title"
                    helperText="Limit title to 50 characters or less"
                />
                <ControlledInput
                    control={control}
                    name="text"
                    label="Question Text"
                    helperText="Limit details to 140 characters or less"
                    multiline
                    minRows={6}
                />
                <ControlledInput
                    control={control}
                    name="tags"
                    label="Tags"
                    helperText="Add keywords separated by whitespace"
                />
                <Box>
                    <Button variant="outlined" onClick={submit}>
                        Post Question
                    </Button>
                </Box>
            </Stack>
        </Stack>
    )
}
