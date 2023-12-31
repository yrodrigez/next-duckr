import {createServerComponentClient} from '@supabase/auth-helpers-nextjs'
import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {PostsList} from './components/posts-list'
import {type Database} from './types/database'
import {CreatePost} from './components/create-post-server'

export const dynamic = 'force-dynamic'
export default async function Home() {
    const database = createServerComponentClient<Database>({cookies})
    const {
        data: posts,
    } = await database.from('posts')
        .select('*, user:users(*), likes(*), replies:posts(id, content, created_at, user:users(*), likes(*))')
        .filter('post_id', 'is', null)
        .order('created_at', {ascending: false})

    const {data: {session}} = await database.auth.getSession()
    if (!session) redirect('/login')

    return (
        <div className="max-w-[600px] w-full h-full flex flex-col overflow-auto">
            <CreatePost avatarUrl={session?.user?.user_metadata?.avatar_url}/>
            <PostsList posts={posts}/>
        </div>
    )
}
