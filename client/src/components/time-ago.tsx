import pluralize from "pluralize"
import { useCallback, useEffect, useState } from "react"

const SINGLE_MIN_MS = 60 * 1000
const SINGLE_HR_MS = 60 * SINGLE_MIN_MS
const SINGLE_DAY_MS = 24 * SINGLE_HR_MS

interface Props {
    value: string | Date
}
export default function TimeAgo({ value }: Props) {
    const computeNewStamp = useCallback(() => {
        const dateValue = new Date(value)
        const diff = Date.now() - dateValue.getTime()
        if (diff < 0)
            return dateValue.toJSON()
        if (diff === 0)
            return "just now"
        if (diff < SINGLE_DAY_MS) {
            if (diff < SINGLE_HR_MS) {
                if (diff < SINGLE_MIN_MS) {
                    const out = Math.round(diff / 1000)
                    return `${out} ${pluralize("second", out)} ago`
                }

                const out = Math.round(diff / SINGLE_MIN_MS)
                return `${out} ${pluralize("minute", out)} ago`
            }

            const out = Math.round(diff / SINGLE_HR_MS)
            return `${out} ${pluralize("hour", out)} ago`
        }
        const year = dateValue.getFullYear()
        const month = dateValue.toLocaleString("en-US", { month: "short" })
        const day = dateValue.getDate()
        const hours = String(dateValue.getHours()).padStart(2, "0")
        const minutes = String(dateValue.getMinutes()).padStart(2, "0")
        return `${month} ${day}, ${year} at ${hours}:${minutes}`
    }, [value])

    const [stamp, setStamp] = useState(computeNewStamp())

    useEffect(() => {
        const intId = window.setInterval(() => {
            setStamp(computeNewStamp())
        }, 1000)
        return () => {
            window.clearInterval(intId)
        }
    }, [computeNewStamp])

    return (
        <>{stamp}</>
    )
}
