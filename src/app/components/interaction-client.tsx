import {Card, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useContext, useEffect, useState} from "react";

import {type User} from "@/app/types/user";
import {type Post} from "@/app/types/posts";

import {AvatarClient} from "@/app/components/avatar-client";
import {FollowButton} from "@/app/components/follow-button-client";
import {SessionContext} from "@/app/components/context-providers/session-context";


const Likes = ({post}: {
    post: Post
}) => {
    const {
        id: postId,
    } = post

    const database = createClientComponentClient()
    const [likes, setLikes] = useState([] as User[])
    const [follows, setFollows] = useState([] as User[])
    const {sessionContext} = useContext(SessionContext) as any
    const currentUser = sessionContext?.user
    const currentUserId = currentUser?.id

    useEffect(() => {
        database.from('likes')
            .select('user:users(*)')
            .filter('post_id', 'eq', postId)
            .order('created_at', {ascending: false})
            .then(({data}: any) => {
                const fetchedLikes = (data?.map((x: any) => {
                    return x?.user
                }) || [])
                if (likes.length > 0) {
                    const index = fetchedLikes.findIndex(({user_id}: any) => user_id === currentUserId)
                    if (index > 0) {
                        const temp = {...fetchedLikes[index]}
                        fetchedLikes.splice(index, 1)
                        fetchedLikes.unshift(temp)
                    }
                }

                setLikes(fetchedLikes);
            })
        database.from('follows')
            .select('*')
            .filter('follower_id', 'eq', currentUserId).then(({data}: any) => {
            setFollows(data || [])
        })
    }, [database, postId])

    // move the loged user to the top of the list

    return likes.map((user, index) => {
        const {
            avatar_url: avatarUrl,
            name: userFullName,
            user_name: userName,
            id: userId
        } = user
        return (
            <div key={userId} className="flex justify-between hover:bg-white/10 p-4">
                <div className="flex gap-3">
                    <AvatarClient radius="full" size="md" src={avatarUrl}/>
                    <div
                        className={`flex flex-col gap-1 items-start`}>
                        <h4 className="text-small font-semibold leading-none text-default-600">{userFullName}</h4>
                        <h5 className="text-small tracking-tight text-default-400">@{userName}</h5>
                    </div>
                </div>
                {
                    currentUserId &&
                  <FollowButton
                    userToFollow={user}
                    follows={follows}
                    currentUserId={currentUserId}
                  />
                }
            </div>
        )
    })
}

export const Interaction = ({
                                name,
                                value,
                                post
                            }: {
    name: 'Likes' | 'Reposts' | 'Quotes' | 'Bookmarks',
    value: number,
    post: any
}) => {
    const {
        isOpen,
        onOpen,
        onOpenChange
    } = useDisclosure();

    return ((value > 0) ? (
        <>
            <div className="flex gap-2 mr-6">
                <span className="text-white">{value}</span>
                <span className="hover:underline cursor-pointer" onClick={onOpen}>{name}</span>
            </div>
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
            >
                <Card>
                    <ModalContent className="p-0">
                        {() => (
                            <>
                                <ModalHeader className="bg-black">Liked by</ModalHeader>
                                <ModalBody className="bg-black p-0 gap-0">
                                    {
                                        name === 'Likes' ?
                                            <Likes post={post}/>
                                            : <></>
                                    }
                                </ModalBody>
                                <ModalFooter className="bg-black">
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Card>
            </Modal>
        </>
    ) : null)
}
