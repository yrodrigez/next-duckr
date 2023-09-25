'use client'
import {Avatar, AvatarGroup} from "@nextui-org/react";
import {SessionContext} from "@/app/providers";
import {useContext} from "react";

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
    console.log(output.length)
    return output.length > 38 ? output.substring(0, 38) + "..." : output;
}

export function ChatRoomTitle({
                                  members,
                                  roomName
                              }: any) {
    const {sessionContext} = useContext(SessionContext) as any
    const currentUser = sessionContext?.user
    const membersWithoutLoggedUser = members.filter(({users}: any) => users?.id !== currentUser?.id)

    return (
        <div
            className="w-full h-14 border-b border-white/30 flex px-6 py-2 items-center hover:bg-white/10 transition-all">
            <AvatarGroup max={3}>
                {members.map((user: any) => <Avatar key={user?.id} src={user?.avatar_url}/>)}
            </AvatarGroup>
            <p className="h-fit ml-2">{roomName ? roomName : formatUserList(membersWithoutLoggedUser)}</p>
        </div>
    )
}
