import { useState } from "react"
import api from "../api"

export default function useVote(pid: string, initial: number) {
    const [userVote, setUserVote] = useState(initial)

    const upvotePost = async () => {
        try {
            await api.post(`/vote/${pid}`, { value: 1 })
            // setUserVote(prev => prev + 1)
            window.alert("changes reflected on refresh")
        } catch (e) {
            console.error(e)
            window.alert("cannot upvote any further")
        }
    }

    const undovotePost = async () => {
        try {
            await api.delete(`/vote/${pid}`)
            window.alert("changes reflected on refresh")
        } catch (e) {
            console.error(e)
            window.alert("nothing to unvote")
        }
    }

    const downvotePost = async () => {
        try {
            await api.post(`/vote/${pid}`, { value: -1 })
            // setUserVote(-1)
            window.alert("changes reflected on refresh")
        } catch (e) {
            console.error(e)
            window.alert("cannot downvote any further")
        }
    }

    return {
        userVote,
        upvotePost,
        undovotePost,
        downvotePost
    }
}
