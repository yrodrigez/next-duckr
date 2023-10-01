'use client'

import {IconMessages} from "@tabler/icons-react";
import {ChatMessagesRead} from "@/app/components/chat/chat-messages-read-client";
import {useContext} from "react";
import {SessionContext} from "@/app/providers";

export function PanelChatsButton() {
    const {sessionContext: session}: any = useContext(SessionContext);
    return (
        <div className="relative">
            <ChatMessagesRead filters={{
                user_id: session?.user?.id,
                unreadOnly: true
            }}>
                {(unreadMessages: any) => (
                    <>
                        <IconMessages size={40} color="white" className="m-0"/>
                        {
                            (unreadMessages?.length || 0) > 0 && (
                                <div
                                    className="absolute -top-1 -right-1 p-1 py-1 -z-10 rounded-full bg-sky-500 flex justify-center items-center">
                                    <p className="text-white text-xs"></p>
                                </div>
                            )
                        }
                    </>
                )}
            </ChatMessagesRead>
        </div>
    )
}
