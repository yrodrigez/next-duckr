import {createContext, type ReactNode} from "react";
import {MessageReadEvent, useChatMessagesRead} from "@/app/components/chat/chat-messages-read-hook";

export const ChatMessagesReadContext = createContext<MessageReadEvent[]>([]);

export default function ({children}: { children: ReactNode }) {
    const chatMessagesRead = useChatMessagesRead()

    return (
        <ChatMessagesReadContext.Provider value={chatMessagesRead}>
            {children}
        </ChatMessagesReadContext.Provider>
    )
}
