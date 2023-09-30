'use client'
import React, {experimental_useOptimistic as useOptimistic, useEffect, useRef, useState} from "react";
import moment from "moment";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";

import {useRouter} from "next/navigation";

const PinScrollToBottom = ({
                               className,
                               children
                           }: { className?: string, children?: any }) => {
    const ref = useRef<HTMLDivElement>(null)
    const [scrolledUp, setScrolledUp] = useState(false)

    const scroll = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollTo(0, ref.current?.scrollHeight)
    }

    useEffect(() => {
        const {current} = ref
        if (!current) return

        if (scrolledUp) return
        scroll(ref)
    })

    return (
        <div
            onScroll={(e) => {
                const {
                    scrollTop,
                    scrollHeight,
                    clientHeight
                } = e.target as HTMLDivElement
                setScrolledUp((scrollTop + clientHeight) < scrollHeight)
            }}
            ref={ref}
            className={className || 'flex flex-col gap-3 p-5 overflow-auto flex-grow scroll-smooth'}>
            {children}
        </div>
    )
}

const updateOrInsertMessage = (messages: any, newMessage: any) => {
    const newMessages = [...messages];
    const indexById = newMessages.findIndex(msg => msg.id === newMessage.id);

    if (indexById !== -1) {
        newMessages[indexById] = newMessage;
        return newMessages;
    }

    const indexByDate = newMessages.findIndex(msg => msg.created_at < newMessage.created_at);
    if (indexByDate === -1) {
        newMessages.push(newMessage);
    } else {
        newMessages.splice(indexByDate, 0, newMessage);
    }

    return newMessages;
};

export function ChatMessages({
                                 messages,
                                 currentUserId,
                             }: {
    messages?: any, currentUserId?: any
}) {
    const [optimisticMessages, addOptimisticMessage] = useOptimistic<any, any>(messages, (currentMessages, newMessage) => {
        if (!currentMessages || !newMessage) return currentMessages;

        return updateOrInsertMessage(currentMessages, newMessage);
    })
    const router = useRouter()
    const database = createClientComponentClient()
    useEffect(() => {
        const messagesChannel = database.channel('realtime messages')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chat_messages'
            }, router.refresh).subscribe()

        return () => {
            database.removeChannel(messagesChannel)
        }
    }, [database, optimisticMessages])

    const formattedDate = (date: any) => moment(date).format('MMM DD, YYYY')
    return (
        <PinScrollToBottom>
            {optimisticMessages?.map(({
                                          user,
                                          message,
                                          created_at
                                      }: any) => (
                <div key={created_at}
                     className={`flex flex-col gap-1  ${currentUserId === user?.id ? 'self-end' : 'self-start'} flex flex-col`}>
                    <div className={`flex gap-2 flex-row ${currentUserId === user?.id ? 'flex-row-reverse' : ''}`}>
                        {currentUserId !== user?.id && user?.avatar_url &&
                          <img src={user?.avatar_url} className="w-8 h-8 rounded-full self-end"
                               alt={`${user.user_name} avatar`}/>}
                        <div
                            className={`px-3 py-2 ${currentUserId !== user?.id ? 'bg-green-700' : 'bg-gray-500'} rounded h-full flex flex-col`}>
                    <span
                        className="text-gray-300 text-xs">{`${currentUserId === user?.id ? 'you' : `@${user?.user_name}`}`}</span>
                            <p className="text-white max-w-[350px]">{message}</p>
                            <span
                                className={`text-gray-300 text-xs text-right`}>{formattedDate(created_at)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </PinScrollToBottom>
    )
}
