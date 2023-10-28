'use client'
import {type Post} from "@/app/types/posts";
import {LikeButton} from "@/app/components/like-button-client";
import {useOptimistic} from "react";
import {InteractionsActions} from "@/app/components/interactions-client";

export function ReplyFooterClient({post}: { post: Post }) {
    const [optimisticPost, addOptimisticPost] = useOptimistic<Post | null, Post>(post,
        (currentPost, newPost) => {
            return newPost

        })
    return (
        <InteractionsActions
            post={optimisticPost}
            addPostOptimistic={addOptimisticPost}
            showCount
            className="flex flex-1 justify-around text-default-400"
        />
    )
}
