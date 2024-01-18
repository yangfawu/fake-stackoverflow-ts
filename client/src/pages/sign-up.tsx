import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, Box, Button, Stack, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import { useActionData, useSubmit } from "react-router-dom"
import { z } from "zod"
import ControlledInput from "../components/controlled-input"

const schema = z.object({
    email: z.string()
        .trim()
        .email("expected a valid email"),
    name: z.string()
        .min(1, "username cannot be empty"),
    password: z.string()
        .min(8, "password must be at least 8 characters"),
    password_confirm: z.string()
        .min(1, "password confirmation is needed"),
}).refine((data) => /[A-Z]/.test(data.password), {
    path: ["password"],
    message: "password does not have >= 1 uppercase",
}).refine((data) => /[0-9]/.test(data.password), {
    path: ["password"],
    message: "password does not have >= 1 digit",
}).refine((data) => data.password === data.password_confirm, {
    path: ["password_confirm"],
    message: "passwords do not match",
})

type FormSchemaType = z.infer<typeof schema>

export default function SignUp() {
    const routerSubmit = useSubmit()

    const { control, handleSubmit } = useForm<FormSchemaType>({
        defaultValues: {
            email: "",
            name: "",
            password: "",
            password_confirm: "",
        },
        resolver: zodResolver(schema),
        mode: "all"
    })

    const actionData = useActionData() as { error: string } | undefined

    const submit = handleSubmit(values => {
        routerSubmit(values, {
            action: "/signup",
            method: "POST"
        })
    })

    return (
        <Stack spacing={3} sx={{ py: 4 }}>
            <Typography variant="h4">Sign Up</Typography>
            <Stack spacing={3} maxWidth={500}>
                {
                    actionData?.error &&
                    <Alert severity="error">{actionData.error}</Alert>
                }
                <ControlledInput
                    control={control}
                    name="email"
                    label="Email"
                    type="email"
                />
                <ControlledInput
                    control={control}
                    name="name"
                    label="Username"
                />
                <ControlledInput
                    control={control}
                    name="password"
                    label="Password"
                    type="password"
                    helperText="use >= 8 characters with >= 1 uppercase and >= 1 number"
                />
                <ControlledInput
                    control={control}
                    name="password_confirm"
                    label="Password Confirmation"
                    type="password"
                />
                <Box>
                    <Button variant="outlined" onClick={submit}>
                        Register
                    </Button>
                </Box>
            </Stack>
        </Stack>
    )
}
