import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useActionData, useParams, useSubmit } from "react-router-dom"
import { z } from "zod"
import { findLinkIssues } from "../util"
import { Alert, Box, Button, Stack, Typography } from "@mui/material"
import ControlledInput from "../components/controlled-input"

const schema = z.object({
    text: z.string()
        .trim()
        .min(1, "text is required")
        .max(140, "cannot exceed 140 characters"),
})

type FormSchemaType = z.infer<typeof schema>

export default function NewComment() {
    const params = useParams()

    const routerSubmit = useSubmit()
    const { control, handleSubmit, setError } = useForm<FormSchemaType>({
        defaultValues: {
            text: "",
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
            action: `/new-comment/${params["pid"]}`,
            method: "POST"
        })
    })

    return (
        <Stack spacing={3} sx={{ py: 4 }}>
            <Typography variant="h4">New Comment</Typography>
            <Stack spacing={3} maxWidth={500}>
                {
                    actionData?.error &&
                    <Alert severity="error">{actionData.error}</Alert>
                }
                <ControlledInput
                    control={control}
                    name="text"
                    label="Comment Text"
                    multiline
                    minRows={6}
                />
                <Box>
                    <Button variant="outlined" onClick={submit}>
                        Post Comment
                    </Button>
                </Box>
            </Stack>
        </Stack>
    )
}
