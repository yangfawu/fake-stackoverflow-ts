import { memo } from "react"

const delimiter = /(\[[^[\]]+\]\(https?:\/\/[^()]+\))/
const extractor = /\[(?<name>[^[\]]+)\]\((?<url>https?:\/\/[^()]+)\)/

// prevent unnecessary re-renders when we deal with the same text
const HyperlinkView = memo(({ value }: { value: string }) => {
    const jsxSegments = []

    let i = 0
    for (const segment of value.split(delimiter)) {
        if (!delimiter.test(segment)) {
            jsxSegments.push(<span key={i++}>{segment}</span>)
            continue
        }

        const match = segment.match(extractor)
        if (!match)
            throw new Error("Should've been a match")

        try {
            // @ts-ignore
            const { name, url } = match.groups
            new URL(url)
            jsxSegments.push(<a key={i++} href={url} target="_blank" rel="noreferrer">{name}</a>)
        } catch (e) {
            jsxSegments.push(<span key={i++}>{segment}</span>)
        }
    }

    return (
        <>{jsxSegments}</>
    )
})

export default HyperlinkView
