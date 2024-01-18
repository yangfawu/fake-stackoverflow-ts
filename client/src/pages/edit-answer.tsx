import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, Box, Button, Stack, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import { useActionData, useLoaderData, useSubmit } from "react-router-dom"
import { z } from "zod"
import ControlledInput from "../components/controlled-input"
import { findLinkIssues } from "../util"

interface Data {
    success: boolean
    data: {
        _id: string
        text: string
    }
}

const schema = z.object({
    text: z.string()
        .trim()
        .min(1, "text is required")
        .max(140, "cannot exceed 140 characters"),
})

type FormSchemaType = z.infer<typeof schema>

export default function EditAnswer() {
    const routerSubmit = useSubmit()
    const { data } = useLoaderData() as Data
    const { control, handleSubmit, setError } = useForm<FormSchemaType>({
        defaultValues: {
            text: data.text || "",
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
            action: `/edit-answer/${data._id}`,
            method: "POST"
        })
    })

    return (
        <Stack spacing={3} sx={{ py: 4 }}>
            <Typography variant="h4">Edit Answer</Typography>
            <Stack spacing={3} maxWidth={500}>
                {
                    actionData?.error &&
                    <Alert severity="error">{actionData.error}</Alert>
                }
                <ControlledInput
                    control={control}
                    name="text"
                    label="Answer Text"
                    multiline
                    minRows={6}
                />
                <Box>
                    <Button variant="outlined" onClick={submit}>
                        Update Answer
                    </Button>
                </Box>
            </Stack>
        </Stack>
    )
}
