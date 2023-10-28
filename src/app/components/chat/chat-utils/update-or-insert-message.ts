import {type ChatMessage} from "@/lib/chat/get-room-messages";

/**
 *
 *
 * @param {ChatMessage[]} messages - The current list of messages.
 * @param {ChatMessage} newMessage - The new or updated message.
 * @returns {ChatMessage[]} - An updated list of messages.
 *
 * @description
 * Updates an existing message or inserts a new message into the messages list.
 */
export const updateOrInsertMessage = (messages: ChatMessage[], newMessage: ChatMessage): ChatMessage[] => {
    // Creates a copy of the current list of messages.
    const newMessages = [...messages]

    // Finds the index of the message with the same ID as the newMessage.
    const indexById = newMessages.findIndex(msg => msg.id === newMessage.id)

    // If the message is found (i.e., the index is not -1), it updates the message.
    if (indexById !== -1) {
        newMessages[indexById] = newMessage
        return newMessages
    }

    // If the message is not found in the list, it adds the new message to the end of the list.
    newMessages.push(newMessage)

    // Returns the updated list of messages.
    return newMessages
}

