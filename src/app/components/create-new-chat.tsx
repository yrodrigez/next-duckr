'use client'
import {IconMessagePlus, IconCheck, IconLoader2} from "@tabler/icons-react";
import {useContext, useEffect, useState} from "react";
import {SessionContext} from "@/app/components/context-providers/session-context";
import {Card, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure} from "@nextui-org/react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useRouter} from "next/navigation";

function chatRoomExists(database: any, user: any, selection: any) {
    return new Promise((done, error) => {
        database.from('chat_room_members_view')
            .select('room_id, members:member_ids')
            .then(({
                       data,
                       error: err
                   }: any) => {
                if (err) return error(err)
                if (!data?.length) done({data: []})
                const rooms = data.filter((room: any) => {
                    if (!room.members) return false
                    const selectionWithUser = [user?.id, ...selection]
                    return room.members.every((member: any) => {
                        return selectionWithUser.includes(member)
                    }) && selectionWithUser.length === room.members.length
                })
                done({data: rooms})
            })
    })
}

function createChatRoom(database: any, user: any, selection: any) {
    return new Promise((done, error) => {
        database.from('chat_rooms').insert({
            owner_id: user.id,
        }).select().then(({
                              error: err,
                              data: rooms
                          }: any) => {
            if (err) return error(err)

            database.from('chat_room_members')
                .insert([user?.id, ...selection].map((userId: any) => ({
                        user_id: userId,
                        room_id: rooms[0].id
                    })
                )).select().then(({
                                      data,
                                      err
                                  }: any) => {

                if (err) return error(err)
                done({data})
            })
        })
    })
}

function handleChatRoomSelection(database: any, user: any, selection: any) {
    return new Promise((done, error) => {
        chatRoomExists(database, user, selection).then(({data}: any) => {
            if (data?.length) {
                done(`/chats/${data[0].room_id}`)
            } else {
                createChatRoom(database, user, selection).then(({data}: any) => {
                    done(`/chats/${data[0].room_id}`)
                }).catch((err: any) => {
                    error(err)
                })
            }
        }).catch((err: any) => {
            error(err)
        })
    })
}

const ChatUsersView = () => {
    const sessionContext = useContext(SessionContext) as any
    const {user} = sessionContext?.sessionContext || {} as any
    const database = createClientComponentClient()
    const [users, setUsers] = useState([] as any[])
    const [selection, setSelection] = useState([] as any[])
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        database.from('users').select('*').filter(
            'id',
            'neq',
            user?.id
        ).then(({data}: any) => {
            setUsers(data || [])
        })
    }, [database])

    return (
        <div className="flex flex-col border-t border-white/30 max-h-[600px]">
            <div className="overflow-auto flex-grow-2">
                {users.map((user, index) => (
                    <div
                        onClick={() => {
                            if (selection.includes(user.id)) {
                                setSelection(selection.filter((x: any) => x !== user.id))
                            } else {
                                setSelection([...selection, user.id])
                            }
                        }}
                        key={user.id}
                        className="hover:bg-white/10 hover:cursor-pointer flex border-b border-white/30 py-2 px-4 items-center">
                        <img src={user.avatar_url} alt={`User avatar`} className="w-8 h-8 rounded-full mr-2"/>
                        <div className="flex flex-col">
                            {user.name}
                            <span className="text-gray-500 text-xs">@{user.user_name}</span>
                        </div>
                        {selection.includes(user.id) && <IconCheck className="ml-auto text-green-500 w-6 h-6"/>}
                    </div>
                ))}
            </div>
            <div className="flex flex-1 self-end my-3">
                <button
                    disabled={selection.length === 0}
                    onClick={() => {
                        setLoading(true)
                        handleChatRoomSelection(database, user, selection).then((path: any) => {
                            router.push(path)
                        })
                    }}
                    className="flex gap-1 bg-sky-500 text-white rounded-full p-2 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-50">
                    {loading ? <><IconLoader2 className="animate-spin w-6 h-6"/> Redirecting</> : 'Create chat'}
                </button>
            </div>
        </div>
    )
}

export function CreateNewChat() {

    const {
        isOpen,
        onOpen,
        onOpenChange
    } = useDisclosure();
    return (
        <>
            <div
                className="absolute bottom-[6rem] md:bottom-[4rem] right-4 z-10">
                <button onClick={onOpen} className="rounded-full bg-sky-500 p-3"><IconMessagePlus size={30}
                                                                                                  color="white"/>
                </button>
            </div>

            <Modal

                isOpen={isOpen}
                disableAnimation
                onOpenChange={onOpenChange}
                placement="top"
                classNames={{
                    backdrop: 'bg-[rgba(255,255,255,0.2)]',
                    closeButton: 'bg-black'
                }}
            >
                <Card>
                    <ModalContent className="p-0">
                        {() => (
                            <>
                                <ModalHeader className="bg-black">Create a chat with</ModalHeader>
                                <ModalBody className="bg-black p-2">
                                    <ChatUsersView/>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Card>
            </Modal>
        </>
    )
}
