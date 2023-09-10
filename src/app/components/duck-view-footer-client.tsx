'use client'

import {InteractionsActions} from "@/app/components/interactions-client";
import {type Post} from "@/app/types/posts";
import {experimental_useOptimistic as useOptimistic} from "react";
import {Interaction} from "@/app/components/interaction-client";

const SectionContainer = ({children}: { children?: React.ReactNode }) => {
    return (
        <div className="flex pb-3 pt-3 text-default-400 border-t border-white/20">
            {children}
        </div>
    )
}

export function DuckViewFooterClient({
                                         post,
                                     }: any) {

    const [optimisticPost, addOptimisticPost] = useOptimistic<Post | null, Post>(post,
        (currentPost, newPost) => {
            return newPost
        })

    return (
        <>
            <SectionContainer>
                <Interaction post={post} name="Reposts" value={0}/>
                <Interaction post={post} name="Quotes" value={0}/>
                <Interaction post={post} name="Likes" value={optimisticPost?.likes?.length || 0}/>
                <Interaction post={post} name="Bookmarks" value={0}/>
            </SectionContainer>
            <SectionContainer>
                <InteractionsActions
                    iconSize={6}
                    post={optimisticPost}
                    addPostOptimistic={addOptimisticPost}
                />
            </SectionContainer>
            <SectionContainer>
            </SectionContainer>
        </>
    )
}
