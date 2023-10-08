"use client"
import {Avatar, AvatarGroup} from "@nextui-org/react";
import {SessionContext} from "@/app/providers";
import {useContext, useEffect, useState} from "react";
import {IconChevronLeft} from "@tabler/icons-react";
import {useRouter} from "next/navigation";
import {ChatMember} from "@/app/chats/[room_id]/page";

function formatUserList(users: any[]) {
    let output = "You";

    if (users.length <= 3) {
        users.forEach((user, index) => {
            if (index === users.length - 1) {
                output += " and ";
            } else {
                output += ", ";
            }
            output += user.name;
        });
    } else {
        output += ", ";
        for (let i = 0; i < 3; i++) {
            output += users[i].name;
            if (i < 2) {
                output += ", ";
            }
        }
        const remaining = users.length - 3;
        output += ` and ${remaining} others`;
    }

    return output.length > 38 ? output.substring(0, 38) + "..." : output;
}

export function ChatRoomTitle({
                                  members,
                                  roomName,
                                  unreadCount,
                                  withBackButton
                              }: any) {
    const {sessionContext} = useContext(SessionContext) as any
    const currentUser = sessionContext?.user
    const membersWithoutCurrentUser = members.filter(({id}: any) => id !== currentUser?.id)
    const router = useRouter()

    return (
        <div
            className={`w-full h-14 border-r border-b border-white/30 flex ${withBackButton ? 'px-2' : 'px-6'} py-2 items-center hover:bg-white/10 transition-all`}>
            {withBackButton && <span className="mr-2" onClick={(e) => {
                e.preventDefault()
                router.back()
            }}>
              <IconChevronLeft/>
            </span>}
            {membersWithoutCurrentUser.length > 1 ?
                <AvatarGroup max={3}>
                    {membersWithoutCurrentUser.sort((x: ChatMember, y: ChatMember) => (
                        x.isOnline ? 1 : -1
                    )).map((user: any) => (
                        <Avatar
                            isBordered={user.isOnline}
                            color="success"
                            key={user?.id}
                            src={user?.avatar_url}
                        />
                    ))}
                </AvatarGroup>
                :

                <Avatar
                    src={membersWithoutCurrentUser[0].avatar_url}/>
            }
            <p className="h-fit ml-2 text-white">{roomName ? roomName : formatUserList(membersWithoutCurrentUser)}</p>
            {withBackButton && membersWithoutCurrentUser.length === 1 && <div
              className={`w-3 h-3 ml-2 rounded-full ${membersWithoutCurrentUser[0].isOnline ? 'bg-green-500' : 'bg-gray-500'}`}/>
            }
            {
                unreadCount > 0 && <span
                className="ml-auto bg-sky-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
            }
        </div>
    )
}
