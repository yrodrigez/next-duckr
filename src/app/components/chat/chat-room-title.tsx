'use client'
import {Avatar, AvatarGroup} from "@nextui-org/react";
import {SessionContext} from "@/app/providers";
import {useContext} from "react";
import {IconChevronLeft} from "@tabler/icons-react";

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
    const membersWithoutLoggedUser = members.filter(({id}: any) => id !== currentUser?.id)
    return (
        <div
            className={`w-full h-14 border-b border-white/30 flex ${withBackButton ? 'px-2' : 'px-6'} py-2 items-center hover:bg-white/10 transition-all`}>
            {withBackButton && <span className="mr-2" onClick={(e) => {
                e.preventDefault()
                window.history.back()
            }}>
              <IconChevronLeft/>
            </span>}
            <AvatarGroup max={3}>
                {membersWithoutLoggedUser.map((user: any) => <Avatar isBordered={user.isOnline} color="success"  key={user?.id} src={user?.avatar_url}/>)}
            </AvatarGroup>
            <p className="h-fit ml-2 text-white">{roomName ? roomName : formatUserList(membersWithoutLoggedUser)}</p>
            {unreadCount > 0 && <span
              className="ml-auto bg-sky-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>}
        </div>
    )
}
