import React from "react";
import moment from "moment/moment";
import {IconCheck, IconChecks} from "@tabler/icons-react";

type BubbleUser = {
    id: string,
    user_name: string,
    avatar_url: string
}

type ChatMessageStatus = {
    received_at: string | null,
    read_at: string | null,
    user_id: string
}

export type ChatMessageBubbleProps = {
    currentUserId?: string,
    user: BubbleUser,
    message: string,
    created_at: string
    statuses?: ChatMessageStatus[]
}

export function ChatMessageBubble({
                                      currentUserId,
                                      user,
                                      message,
                                      created_at,
                                      statuses
                                  }: ChatMessageBubbleProps) {
    const formattedDate = (date: string) => moment(date).format('HH:mm')
    const isCurrentUser = currentUserId === user?.id
    const MessageStatus = () => {
        const messageStatuses = statuses?.filter((x: ChatMessageStatus) => x?.user_id !== currentUserId)
        if (!messageStatuses?.length) return <IconCheck width={18} className="text-gray-300"/>
        return messageStatuses.some((x: ChatMessageStatus) => !x?.read_at) ?
            <IconCheck width={18} className="text-gray-300"/> :
            <IconChecks width={18} className="text-sky-500"/>
    }

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
                    <div
                        className={`absolute -bottom-5 ${isCurrentUser ? 'right-1' : 'left-1'} flex items-center gap-1`}>
                        <span
                            className={`text-gray-300 text-xs text-right`}>{formattedDate(created_at)}</span>
                        {isCurrentUser && <MessageStatus/>}
                    </div>
                </div>
            </div>
        </div>
    )
}
