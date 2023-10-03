'use client'
import {IconMessages} from "@tabler/icons-react";
import {type MessageReadEvent} from "@/app/components/chat/chat-messages-read-hook";
import {useContext, useEffect, useState} from "react";
import {SessionContext, ChatMessagesReadContext} from "@/app/providers";

export function PanelChatsButton() {
    const {sessionContext: session}: any = useContext(SessionContext);
    const unreadMessages = useContext(ChatMessagesReadContext);

    const [hasUnreadMessages, setHasUnreadMessages] = useState<number>(0)

    useEffect(() => {
        setHasUnreadMessages(unreadMessages?.filter((msg: MessageReadEvent) =>
            msg.user_id === session?.user?.id && !msg.read_at
        ).length || 0)
    }, [unreadMessages]);

    return (
        <div className="relative">
            <IconMessages size={40} color="white" className="m-0"/>
            {
                (hasUnreadMessages || 0) > 0 && (
                    <div
                        className="absolute -top-2 -right-1 p-[0.35rem] -z-10 rounded-full bg-sky-500 animate-bounce-short animate-appearance-in">
                    </div>
                )
            }
        </div>
    )
}
