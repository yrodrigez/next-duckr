'use client'
import Link from "next/link";
import {ChatRoomTitle} from "@/app/components/chat/chat-room-title";
import {ChatMessagesRead} from "@/app/components/chat/chat-messages-read-client";
import {experimental_useOptimistic as useOptimistic} from "react";

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
                const _unreadMessages = unreadMessages?.filter((message: any) => message.room_id === room.id)
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
