'use client'

import {IconMessages} from "@tabler/icons-react";
import {useChatMessagesRead} from "@/app/components/chat/chat-messages-read-hook";
import {useContext, useEffect, useState} from "react";
import {SessionContext} from "@/app/providers";

export function PanelChatsButton() {
    const {sessionContext: session}: any = useContext(SessionContext);
    const unreadMessages = useChatMessagesRead({
        user_id: session?.user?.id,
        unreadOnly: true
    })

    const [hasUnreadMessages, setHasUnreadMessages] = useState<number>(0)

    useEffect(() => {
        setHasUnreadMessages(unreadMessages?.length || 0)
    }, [unreadMessages]);

    return (
        <div className="relative">
            <IconMessages size={40} color="white" className="m-0"/>
            {
                (unreadMessages?.length || 0) > 0 && (
                    <div
                        className="absolute -top-1 -right-1 p-1 py-1 -z-10 rounded-full bg-sky-500 flex justify-center items-center">
                        <p className="text-white text-xs"></p>
                    </div>
                )
            }
        </div>
    )
}
