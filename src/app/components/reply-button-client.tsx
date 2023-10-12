'use client'
import {useState, useRef, useContext} from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Card} from "@nextui-org/react";
import {IconMessageCircle, IconX} from "@tabler/icons-react";
import {type Post} from "@/app/types/posts";
import {DuckHeader} from "./post-card";
import Link from "next/link";
import {AvatarClient} from "./avatar-client";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {SessionContext} from "@/app/components/context-providers/session-context";

export function Reply({
                          post,
                          addOptimisticPost,
                          iconSize,
                          showCount
                      }: { post: any, addOptimisticPost: any, iconSize?: number | string, showCount?: boolean }) {
    const {
        isOpen,
        onOpen,
        onOpenChange
    } = useDisclosure();
    const {
        user,
        replies,
    } = post
    const {
        name: userFullName,
        user_name: userName,

    } = user

    const [content, setContent] = useState('')
    const [pending, setPending] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const {sessionContext} = useContext(SessionContext) as any

    const {avatar_url: avatarUrl}: { avatar_url: any } = sessionContext?.user?.user_metadata || {} as any

    const performReply = () => {
        if (!textAreaRef?.current?.value) return
        const content = textAreaRef.current.value
        const user = sessionContext?.user
        const userId = user?.id
        const postId = post?.id
        if (!userId || !postId) return
        const database = createClientComponentClient()
        const payload = {
            content,
            post_id: postId,
            user_id: userId
        }
        addOptimisticPost({
            ...(post as any),
            replies: [...(replies || []), payload]
        })
        return database.from('posts').insert(payload)
    }
    return (
        <>
            <button onClick={e => {
                e.stopPropagation()
                onOpen()
            }}
                    className="group flex gap-2 items-center relative">
                <div className="relative">
                    <IconMessageCircle
                        className={`${iconSize ? `w-${iconSize} h-${iconSize}` : 'w-4 h-4'} group-hover:text-blue-400`}/>
                    <div
                        className="transition-all rounded-full group-hover:bg-blue-700/20 absolute -left-2 -right-2 -top-2 -bottom-2"/>
                </div>
                {showCount && replies?.length ?
                    <span className="text-sm group-hover:text-blue-400">{replies.length}</span> : null}

            </button>
            <Modal
                onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                }}
                isOpen={isOpen}
                disableAnimation
                onOpenChange={onOpenChange}
                placement="top"
                classNames={{
                    backdrop: 'bg-[rgba(255,255,255,0.2)]',
                    closeButton: 'bg-black'
                }}
                closeButton={(
                    <button className="absolute left-1">
                        <IconX className="w-4 h-4"/>
                    </button>
                )}
            >
                <Card>
                    <ModalContent>
                        {() => (
                            <>
                                <ModalHeader className="bg-black"></ModalHeader>
                                <form action={() => {
                                    setPending(true)
                                    performReply()?.then(({error}) => {
                                        setContent('')
                                        setPending(false)
                                        onOpenChange()
                                    })
                                }} className=" ">
                                    <ModalBody className="bg-black">
                                        <DuckHeader isReplying post={post}/>
                                        <div className="text-sm ml-[60px] text-default-400">Replying to <Link
                                            className="text-sky-600"
                                            href={`/${userName}`}>@{userName || userFullName}</Link>
                                        </div>

                                        <div className="flex flex-1 flex-row gap-y-4 p-3">
                                            <div className="w-[40px]">
                                                <AvatarClient className="w-10 h-10 mr-2" radius="full" size="md"
                                                              src={avatarUrl}/>
                                            </div>
                                            <textarea
                                                ref={textAreaRef}
                                                onChange={e => setContent(e.target.value)}
                                                name="content" rows={4}
                                                className="p-2 w-full text-2xl bg-black placeholder-gray-500 resize-none text-white"
                                                placeholder="Post your reply!"></textarea>
                                        </div>
                                    </ModalBody>
                                    <ModalFooter className="bg-black">
                                        <button onClick={() => {
                                            setPending(true)
                                            performReply()?.then(({error}) => {
                                                setContent('')
                                                setPending(false)
                                                onOpenChange()
                                            })
                                        }} disabled={pending || !content} type="submit"
                                                className="bg-sky-300 font-bold rounded-full px-5 py-2 place-self-end text-sm disabled:opacity-40 disabled:pointer-events-none">
                                            {pending ? 'Replying...' : 'Reply'}
                                        </button>
                                    </ModalFooter>
                                </form>
                            </>
                        )}
                    </ModalContent>
                </Card>
            </Modal>
        </>
    );
}
