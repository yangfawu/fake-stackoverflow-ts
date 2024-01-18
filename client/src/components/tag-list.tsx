import { Alert, Box, Chip } from "@mui/material"
import { useNavigate } from "react-router-dom"

interface Props {
    data: {
        _id: string
        name: string
    }[]
}
export default function TagList({ data }: Props) {
    const navigate = useNavigate()

    const lookupTag = (name: string) => {
        const params = new URLSearchParams()
        params.set("q", `[${name}]`)
        navigate(`/home?${params.toString()}`)
    }

    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {
                data.length < 1 &&
                <Alert severity="info">no tags</Alert>
            }
            {
                data.map(({ _id, name }) => (
                    <Chip key={_id}
                        variant="outlined"
                        label={name}
                        size="small"
                        onClick={() => lookupTag(name)} />
                ))
            }
        </Box>
    )
}
