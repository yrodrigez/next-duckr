import { type ChatMember } from "@/app/chats/[room_id]/page";
import { updateOrInsertMessage } from "@/app/components/chat/chat-utils/update-or-insert-message";
import { useCallback, useEffect } from "react";
import { updateReadAt } from "@/lib/chat/update-read-at";

/**
 * A custom React hook to handle new messages in a chat room.
 *
 * @param {object} database - The database object to interact with.
 * @param {string} roomId - The ID of the chat room.
 * @param {string} currentUserId - The ID of the current user.
 * @param {Array} members - A list of chat members.
 * @param {Function} setMessages - A state setter function to update the chat messages.
 * @param {boolean} isFocused - A boolean indicating if the chat page is currently focused.
 *
 * @returns {void}
 *
 * @description
 * This hook subscribes to database changes related to chat messages and chat message reads.
 * It updates the message list with new messages or modifies existing messages to reflect
 * their read status. The hook also handles updating the page title to notify users of new
 * messages when the chat page is not in focus.
 */
export const useOnNewMessage = (database: any, roomId: string, currentUserId: string, members: any, setMessages: any, isFocused: boolean): void => {

    const setRead = useCallback((newMessageRead: any) => {
        setMessages((prevMessages: any[]) => {
            if (!prevMessages) return [];

            return prevMessages.map((message: any) => {
                if (message.id !== newMessageRead.message_id) return message;

                let newStatusCollection = message.statuses || [];
                const statusIndex = newStatusCollection.findIndex((status: any) => status.id === newMessageRead.id);

                if (statusIndex === -1) {
                    newStatusCollection.push(newMessageRead);
                } else if (!newStatusCollection[statusIndex].read_at && newMessageRead.read_at) {
                    newStatusCollection[statusIndex] = newMessageRead;
                }

                return {
                    ...message,
                    statuses: newStatusCollection
                };
            });
        });
    }, [setMessages]);

    const addMessage = useCallback((newMessage: any) => {
        const user = members?.find((user: ChatMember) => user.id === newMessage.user_id);
        setMessages((prevMessages: any) => updateOrInsertMessage(prevMessages || [], { ...newMessage, user }));
    }, [members, setMessages]);

    const handleNewMessage = useCallback(async ({ new: newMessage }: any) => {
        addMessage(newMessage);
        if (isFocused) {
            await updateReadAt(database, roomId, currentUserId, newMessage.id);
        } else {
            const count = Number(document.title.match(/\((\d+)\)/)?.[1] || 0);
            document.title = `(${count + 1}) new message${count + 1 > 1 ? 's' : ''} - Duckr`;
        }
    }, [addMessage, database, roomId, currentUserId, isFocused]);

    const handleReadMessage = useCallback(({ new: newMessageRead }: any) => {
        setRead(newMessageRead);
    }, [setRead]);

    useEffect(() => {
        const messagesChannel = database.channel('realtime messages');
        messagesChannel
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chat_messages',
                filter: `room_id=eq.${roomId}`
            }, handleNewMessage)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chat_message_read',
                filter: `room_id=eq.${roomId}`
            }, handleReadMessage)
            .subscribe();

        return () => {
            (async () => await database.removeChannel(messagesChannel))();
        };
    }, [database, roomId, handleNewMessage, handleReadMessage]);
};
