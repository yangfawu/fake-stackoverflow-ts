import { Role } from "@config/mongoose"
import { ForbiddenError } from "@error/auth"
import Tag, { TagDocument } from "@model/tag"
import { UserDocument } from "@model/user"

/**
 * Takes a raw piece of text and upserts tag documents under the name of an user
 * @param aggregate the array you want to store all the tag docs you found or created
 * @param tags_text the raw text you need to parse and potentially create tags for
 * @param author the user that will be responsible for new tags
 * @throws {ForbiddenError} if the user don't have permissions to create new tags
 */
async function upsertTags(aggregate: TagDocument[], tags_text: string, author: UserDocument) {
    const tag_names = new Set(
        tags_text.split(/\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 0)
    )

    // make a search for all tags that already exist
    const tags_found = await Tag.find({
        name: { $in: Array.from(tag_names) }
    }).exec()
    for (const tag of tags_found) {
        aggregate.push(tag)
        tag_names.delete(tag.name)
    }

    // add the missing tags, if any
    if (tag_names.size > 0) {
        // allow admins to create new tags even if they don't satisfy the 50 reputation
        if (author.reputation < 50 && author.role !== Role.ADMIN) {
            const new_tags = Array.from(tag_names).join(", ")
            throw new ForbiddenError(`reputation too low to create new tags: ${new_tags}`)
        }

        const new_tags = await Tag.insertMany(
            Array.from(tag_names).map(name => ({
                name,
                author
            })),
            {
                ordered: false
            }
        )
        aggregate.push(...new_tags)
    }
}

const TagService = {
    upsertTags
}
export default TagService
