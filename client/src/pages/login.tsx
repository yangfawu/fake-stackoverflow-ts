import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, Box, Button, Stack, Typography } from "@mui/material"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { Link, useActionData, useLocation, useSubmit } from "react-router-dom"
import { z } from "zod"
import ControlledInput from "../components/controlled-input"

const schema = z.object({
    email: z.string()
        .trim()
        .email("expected a valid email"),
    password: z.string()
        .min(1, "password cannot be empty"),
})

type FormSchemaType = z.infer<typeof schema>

export default function Login() {
    const routerSubmit = useSubmit()
    const location = useLocation()
    const from = useMemo(() => {
        const params = new URLSearchParams(location.search)
        return params.get("from") || "/home"
    }, [location])

    const { control, handleSubmit } = useForm<FormSchemaType>({
        defaultValues: {
            email: "",
            password: ""
        },
        resolver: zodResolver(schema),
        mode: "all"
    })

    const actionData = useActionData() as { error: string } | undefined

    const submit = handleSubmit(values => {
        const payload = {
            ...values,
            from
        }
        routerSubmit(payload, {
            action: "/login",
            method: "POST"
        })
    })

    return (
        <Stack spacing={3} sx={{ py: 4 }}>
            <Typography variant="h4">Log In</Typography>
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
                    name="password"
                    label="Password"
                    type="password"
                />
                <Box>
                    <Button variant="outlined" onClick={submit}>
                        Log In
                    </Button>
                </Box>
                <Typography variant="body2">
                    Don't have an account? <Link to="/signup">Register</Link>
                </Typography>
            </Stack>
        </Stack>
    )
}
