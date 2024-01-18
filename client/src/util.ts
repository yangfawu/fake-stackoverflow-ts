const delimiter = /(\[[^[\]]*\]\([^()]*\))/
const extractor = /\[(?<name>[^[\]]*)\]\((?<url>[^()]*)\)/

export function findLinkIssues(text: string) {
    for (const segment of text.split(delimiter)) {
        if (!delimiter.test(segment))
            continue

        const match = segment.match(extractor)
        if (!match)
            throw new Error("Should've been a match")

        // @ts-ignore
        const { name, url } = match.groups
        if (name.length < 1)
            return `"${segment}" is missing a hyperlink name`
        if (url.length < 1)
            return `"${segment}" is missing a hyperlink URL`
        try {
            if (!url.startsWith("https://") && !url.startsWith("http://"))
                return `"${url}" in "${segment}" must begin with https:// or http://`
            new URL(url)
        } catch (e) {
            return `"${url}" in "${segment}" is not a valid URL`
        }
    }
    return null
}
