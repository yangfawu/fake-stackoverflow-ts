export const TIMESTAMP_CONFIG = {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
}

export enum Role {
    ADMIN="admin",
    USER="user"
}

export enum PostType {
    QUESTION="Question",
    ANSWER="Answer",
    COMMENT="Comment"
}
