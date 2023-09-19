'use client'
import {useState} from "react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";

const tryToFollow = ({
                         userId,
                         currentUserId,
                         database
                     }: { userId: string, currentUserId: string, database: any }) => {
    return database.from('follows').insert({
        user_id: userId,
        follower_id: currentUserId
    })
}
const tryToUnfollow = ({
                           userId,
                           currentUserId,
                           database
                       }: { userId: string, currentUserId: string, database: any }) => {
    return database.from('follows').delete().match({
        user_id: userId,
        follower_id: currentUserId
    })
}

export function FollowButton({
                                 userToFollow,
                                 follows,
                                 currentUserId
                             }: {
    userToFollow: any,
    follows: any,
    currentUserId: any

}) {

    const userToFollowId = userToFollow?.id as string
    const [isDisabled, setIsDisabled] = useState(false)
    const database = createClientComponentClient()
    const [isFollowing, setIsFollowing] = useState(
        follows.some((x: any) => x?.user_id === userToFollowId)
    )
    const follow = async (e: any) => {
        e.stopPropagation()
        if (!currentUserId) return
        if (!userToFollowId) return
        setIsDisabled(true)
        if (isFollowing) {
            tryToUnfollow({
                userId: userToFollowId,
                currentUserId,
                database
            }).then(({error}: { error: any }) => {
                if (error) {
                    setIsFollowing(true)
                    setIsDisabled(false)
                    return
                }
                setIsFollowing(false)
                setIsDisabled(false)
            })
        } else {
            tryToFollow({
                userId: userToFollowId,
                currentUserId,
                database
            }).then(({error}: { error: any }) => {
                if (error) {
                    setIsFollowing(false)
                    setIsDisabled(false)
                    return
                }
                setIsFollowing(true)
                setIsDisabled(false)
            })
        }
    }
    const [isHover, setIsHover] = useState(false)
    return (userToFollowId !== currentUserId) ? <button
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className={`
                flex
                items-center
                justify-center
                w-24 h-8 font-bold rounded-full
                text-sm
                ${isFollowing ? 'hover:border-red-700 border hover:text-red-700' : ''}
                ${isFollowing ? 'border-white border text-white' : 'bg-white text-default'}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`
        }
        onClick={follow}
        disabled={isDisabled}
    >
        {isFollowing ? (isHover ? 'Unfollow' : 'Following') : 'Follow'}
    </button> : null

}
