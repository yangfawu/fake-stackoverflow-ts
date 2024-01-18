import { TextField, TextFieldProps } from "@mui/material"
import { Control, Controller } from "react-hook-form"

interface Props {
    control: Control<any>
    name: string
}
export default function ControlledInput({ control, name, ...props }: Props & TextFieldProps) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                    variant="outlined"
                    fullWidth
                    onChange={onChange}
                    value={value}
                    error={!!error}
                    {...props}
                    helperText={error ? error.message : props.helperText}
                />
            )}
        />
    )
}
