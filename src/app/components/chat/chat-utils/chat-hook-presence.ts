import {useEffect} from "react";
import {type ChatMember} from "@/app/chats/[room_id]/page";

/**
 * @param {any} database - The database instance used for real-time updates.
 * @param {string} roomId - The ID of the chat room.
 * @param {string} currentUserId - The ID of the current user.
 * @param {Function} setMembersWithPresence - Setter function to update members with their presence status.
 *
 * @description
 * A custom hook to track and update user presence status in a chat room.
 * This hook uses the Supabase Realtime Client to track user presence.
 * It updates the members list with their online/offline status.
 */
export const usePresence = (database: any, roomId: string, currentUserId: string, setMembersWithPresence: Function) => {
    useEffect(() => {
        // Initializing the real-time channel for the room.
        const roomStatus = database.channel(`room:${roomId}`, {
            config: {
                presence: {
                    key: currentUserId,
                }
            }
        })

        // Array to store current online user IDs.
        let currentPresences: string[] = []

        roomStatus
            .on('presence', {event: 'sync'}, () => {
                // Retrieving the current online status of users in the room.
                const currentStatus = roomStatus.presenceState()
                currentPresences = Object.keys(currentStatus)

                // Updating members with their online/offline status.
                setMembersWithPresence((membersWithPresence: any) => membersWithPresence?.map((user: ChatMember) => {
                    const isOnline = currentPresences.includes(user?.id)
                    return {
                        ...user,
                        isOnline
                    };
                }));
            })
            .subscribe(() => {
                // Tracking the current user's join event.
                roomStatus.track({user_id: currentUserId}, {event: 'join'})
            });

        // Cleanup function to remove listeners and channels.
        return () => {
            roomStatus.untrack()
            database.removeChannel(roomStatus)
        };
    }, [currentUserId])
}
