import { PostType } from "@config/mongoose"
import Post, { PostDocument } from "@model/post"
import Vote, { VoteDocument } from "@model/vote"
import { concat } from "lodash"

type PostDocumentWithVoteRefs = Omit<PostDocument, "vote_refs"> & { vote_refs: VoteDocument[] }

/**
 * Takes a set of posts and BFS all related questions, answers, and comments.
 * This includes the answers of discovered questions.
 * This includes the comments of discovered answers.
 * It truly explores far and wide.
 * @param posts the set of posts you want to explore
 * @returns all posts related to the original set of posts
 */
async function discoverRelatedPosts(posts: PostDocumentWithVoteRefs[]): Promise<PostDocumentWithVoteRefs[]> {
    if (posts.length < 1)
        return []

    // we only need to explore the questions and answers
    const posts_to_explore = posts.filter(p => p.type !== PostType.COMMENT)
    if (posts_to_explore.length < 1)
        return []
    
    // look for related posts on database
    const related_posts = await Post.find({ parent: { $in: posts_to_explore } })
        .populate<{ vote_refs: VoteDocument[] }>("vote_refs")
        .exec()

    // recursively explore the related of the related
    return concat(
        related_posts,
        await discoverRelatedPosts(related_posts)
    )
}

/**
 * Takes a set of posts, discover related posts & votes, and delete everything.
 * @param posts the set of posts you want to explore and delete
 */
async function deletePostsAndRelatedPosts(posts: PostDocumentWithVoteRefs[]) {
    const related_posts = await discoverRelatedPosts(posts)

    const posts_to_delete = concat(posts, related_posts)

    // delete all votes related to the posts we will delete
    const votes_to_delete = posts_to_delete.map(({ vote_refs }) => vote_refs).flat()
    await Vote.deleteMany({
        _id: { $in: votes_to_delete }
    }).exec()

    // delete the posts
    await Post.deleteMany({
        _id: { $in: posts_to_delete }
    }).exec()
}

const PostService = {
    discoverRelatedPosts,
    deletePostsAndRelatedPosts
}
export default PostService
