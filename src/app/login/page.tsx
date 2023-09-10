import { AuthButtonServer } from "@/app/components/auth-button-server";

export default function Login () {

    return (
        <section className="grid place-content-center min-h-screen">
            <h1 className="font-bold text-xl mb-4 text-center">Login</h1>
            <AuthButtonServer/>
        </section>
    )
}