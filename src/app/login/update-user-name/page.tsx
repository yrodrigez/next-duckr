
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {LogOutButton} from "@/app/components/auth-button-client";
import {SubmitUsernameChange} from "@/app/components/submit-username-change";
import {revalidatePath} from "next/cache";
export const dynamic = 'force-dynamic'
const handleUsernameUpdate = async (formData: FormData) => {
    "use server"
    const database = createServerComponentClient({cookies})
    const {data: {user}} = await database.auth.getUser()
    if (!user) return redirect('/login')
    const username = formData.get('username')?.toString()
    if (!username) return

    const {error} = await database
        .from('users')
        .update({user_name: username})
        .eq('id', user?.id)
    if (error) throw new Error(error.message)
    await database.auth.signOut()

    revalidatePath('/')
}

export default async function UpdateUserNamePage() {
    const database = createServerComponentClient({cookies})
    const {data: {user}} = await database.auth.getUser()
    if (!user) return redirect('/login')

    return (
        <section>
            <h1>The username is empty!</h1>
            <h2>Please update the username to continue using Duckr</h2>
            <form action={handleUsernameUpdate} className="flex flex-col gap-3">
                <input
                    className="rounded-lg border border-gray-400 bg-transparent px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-4 focus:ring-white/20"
                    placeholder="Username"
                    name="username"
                    pattern="^[a-zA-Z0-9_]{4,15}$"
                    title="Username must be between 4 and 15 characters long and can only contain letters, numbers and underscores"
                />
                <SubmitUsernameChange/>
            </form>
            <LogOutButton
                user={user}
            />
        </section>
    );
}
