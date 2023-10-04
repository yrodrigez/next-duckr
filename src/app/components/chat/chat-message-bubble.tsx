import React from "react";
import moment from "moment/moment";

type BubbleUser = {
    id: string,
    user_name: string,
    avatar_url: string
}

export type ChatMessageBubbleProps = {
    currentUserId?: string,
    user: BubbleUser,
    message: string,
    created_at: string
}

export function ChatMessageBubble({  currentUserId, user, message, created_at }: ChatMessageBubbleProps) {
    const formattedDate = (date: any) => moment(date).format(moment().diff(moment(date), 'days') > 0 ? 'MMM DD, YYYY' : 'HH:MM')
    const isCurrentUser = currentUserId === user?.id
    return (
        <div key={created_at}
             className={`flex flex-col gap-1 ${isCurrentUser ? 'ml-auto' : ''} self-baseline flex flex-col mb-4 max-w-[250px]`}>
            <div
                className={`flex gap-2 'flex-row'}`}>
                {currentUserId !== user?.id && user?.avatar_url &&
                  <img src={user?.avatar_url} className="w-8 h-8 rounded-full self-end"
                       alt={`${user.user_name} avatar`}/>}
                <div
                    className={`px-6 py-2 ${isCurrentUser ? 'bg-gray-500' : 'bg-sky-500'} rounded-t-xl ${isCurrentUser ? 'rounded-bl-2xl' : 'rounded-br-2xl'} h-full flex flex-col relative `}>
                    <span className="text-gray-300 text-xs">
                        {`${isCurrentUser ? 'you' : `@${user?.user_name}`}`}
                    </span>
                    <p className="text-white max-w-[350px] break-words">{message}</p>
                    <span
                        className={`text-gray-300 text-xs text-right absolute ${isCurrentUser ? 'right-1' : 'left-1'} -bottom-5`}>{formattedDate(created_at)}</span>
                </div>
            </div>
        </div>
    )
}
