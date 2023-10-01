'use client'
import Link from "next/link";
import {ChatRoomTitle} from "@/app/components/chat/chat-room-title";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {ChatMessagesRead} from "@/app/components/chat/chat-messages-read-client";

export const RoomView = ({
                             room
                         }: { room: any, currentUser?: any }) => {
    const members = room.members.map(({users: user}: any) => user)

    return (
        <Link href={`/chats/${room.id}`} className="flex content-between items-center">
            <ChatRoomTitle members={members} roomName={room.name} unreadCount={room.unreadMessages}/>
        </Link>
    )
}

export function ChatRoomsView({
                                  rooms,
                                  currentUser
                              }: { rooms?: any, currentUser?: any }) {

    const database = createClientComponentClient()
    const router = useRouter()
    useEffect(() => {
        const unreadMessagesChannel = database.channel('realtime unreadMessages')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chat_message_read'
            }, router.refresh).subscribe()
        return () => {
            database.removeChannel(unreadMessagesChannel)
        }
    }, [database, rooms]);

    if (!rooms) {
        return <div className="h-screen flex align-middle justify-center">
            <p className="self-center text-white font-bold text-xl">Start chatting with people!</p>
        </div>
    }

    return (
        <ChatMessagesRead filters={{
            user_id: currentUser?.id,
            unreadOnly: true
        }}>{(unreadMessages: any) => {
            const roomsWithUnreadMessages = rooms?.map((room: any) => {
                const _unreadMessages = unreadMessages?.filter(({message}: any) => message.room.id === room.id)
                return {
                    ...room,
                    unreadMessages: _unreadMessages?.length || 0
                }
            })
            return roomsWithUnreadMessages?.map((room: any) => (
                <RoomView key={room?.id} room={room} currentUser={currentUser}/>
            ))
        }}
        </ChatMessagesRead>
    )

}
