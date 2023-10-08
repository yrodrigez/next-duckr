import {createServerActionClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {revalidatePath} from "next/cache";
import {AvatarClient} from "./avatar-client";
import {NewDuckTextArea} from "./create-post-client";
export const dynamic = 'force-dynamic'
export const addPost = async (formData: FormData, postId?: string) => {
    'use server'
    const content = formData.get('content')?.toString()
    if (!content) return
    const database = createServerActionClient({cookies})
    const {data: {user}} = await database.auth.getUser()
    if (!user) return

    const payload: {
        content: string,
        user_id: string,
        post_id?: string
    } = {
        content,
        user_id: user.id,
    }
    if (postId) {
        payload.post_id = postId
    }

    await database.from('posts').insert(payload)
    revalidatePath('/')
}

export function CreatePost({
                               avatarUrl,
                               postId,
                               noBorder,
                               placeholder
                           }: {
    avatarUrl: string,
    postId?: string,
    noBorder?: boolean,
    placeholder?: string
}) {

    return (
        <form action={async (formData: FormData) => {
            'use server'
            return addPost(formData, postId)
        }}
              className={`flex flex-row p-3 ${noBorder ? '' : `border-b border-white/30`}`}>
            <AvatarClient className="w-10 h-10 mr-2" radius="full" size="md" src={avatarUrl}/>
            <NewDuckTextArea placeholder={placeholder}/>
        </form>
    )
}
