'use client'

import {type Post} from "@/app/types/posts";
import {Reply} from "@/app/components/reply-button-client";
import {IconChartBar, IconRepeat, IconShare} from "@tabler/icons-react";
import {LikeButton} from "@/app/components/like-button-client";

export function InteractionsActions({
                                        post,
                                        addPostOptimistic,
                                        iconSize,
                                        showCount,
                                        className,
                                    }: {
    post?: Post | null,
    addPostOptimistic: Function,
    iconSize?: number | string,
    showCount?: boolean,
    className?: string
}) {
    return (
        <div className={className ? className : 'flex flex-1 justify-around'}>
            <Reply iconSize={iconSize} showCount={showCount} post={post} addOptimisticPost={addPostOptimistic}/>
            <IconRepeat className={`${iconSize ? `w-${iconSize} h-${iconSize}` : 'w-4 h-4'}`}/>
            <LikeButton iconSize={iconSize} showCount={showCount} post={post}
                        addOptimisticPost={addPostOptimistic}/>
            <IconChartBar className={`${iconSize ? `w-${iconSize} h-${iconSize}` : 'w-4 h-4'}`}/>
            <IconShare className={`${iconSize ? `w-${iconSize} h-${iconSize}` : 'w-4 h-4'}`}/>
        </div>
    )
}
