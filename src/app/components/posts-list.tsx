'use client'
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs"
import {PostCard} from "./post-card"
import {type Post} from "@/app/types/posts"
import {useEffect, experimental_useOptimistic as useOptimistic} from "react"
import {useRouter} from "next/navigation";
import Link from "next/link";

export function PostsList({posts}: { posts: any }) {
    const database = createClientComponentClient()
    const router = useRouter()

    const [optimisticPosts, addOptimisticPost] = useOptimistic<Post[] | null, Post>(
        posts,
        (currentPosts, newPost) => {
            if (!currentPosts || !newPost) return currentPosts;
            let newCurrentPosts = [...currentPosts];
            if (!newPost.id) throw new Error('Post must have an id');
            let insertIndex = currentPosts.findIndex(x => x.id === newPost.id);
            if (insertIndex !== -1) {
                newCurrentPosts[insertIndex] = newPost;
                return newCurrentPosts;
            }

            insertIndex = currentPosts.findIndex(x => x.created_at < newPost.created_at);
            if (insertIndex === -1) {
                newCurrentPosts.push(newPost);
            } else {
                newCurrentPosts.splice(insertIndex, 0, newPost);
            }

            return newCurrentPosts;
        });

    useEffect(() => {
        const postsChannel = database.channel('realtime posts')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'posts'
            }, router.refresh).subscribe()
        return () => {
            database.removeChannel(postsChannel)
        }
    }, [router, database, optimisticPosts])

    return optimisticPosts?.map(post => {
        return (
            <PostCard
                key={post.id}
                post={post}
                addOptimisticPost={addOptimisticPost}
            />

        )
    })

}
