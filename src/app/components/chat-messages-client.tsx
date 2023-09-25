'use client'
import {experimental_useOptimistic as useOptimistic, useEffect} from "react";
import moment from "moment";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";

import {useRouter} from "next/navigation";

export function ChatMessages({
                                 messages,
                                 currentUserId
                             }: { messages?: any, currentUserId?: any }) {
    const database = createClientComponentClient()
    const router = useRouter()
    const [optimisticMessages, addOptimisticMessage] = useOptimistic<any, any>(messages, (currentMessages, newMessage) => {
        if (!currentMessages || !newMessage) return currentMessages
        let newCurrentMessages = [...currentMessages]
        if (!newMessage.id) throw new Error('Message must have an id')
        let insertIndex = currentMessages.findIndex((x: any) => x.id === newMessage.id)
        if (insertIndex !== -1) {
            newCurrentMessages[insertIndex] = newMessage
            return newCurrentMessages
        }

        insertIndex = currentMessages.findIndex((x: any) => x.created_at < newMessage.created_at)
        if (insertIndex === -1) {
            newCurrentMessages.push(newMessage)
        } else {
            newCurrentMessages.splice(insertIndex, 0, newMessage)
        }

        return newCurrentMessages
    })

    useEffect(() => {
      const messagesChannel = database.channel('realtime messages')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'chat_messages'
        }, (new_message) => {
            console.log('new_message', new_message)
            addOptimisticMessage(new_message)
        }).subscribe()
        return () => {
            database.removeChannel(messagesChannel)
        }
    }, [database, optimisticMessages, messages])

    const formattedDate = (date: any) => moment(date).format('MMM DD, YYYY')
    return optimisticMessages?.map(({
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
    ))
}
