import LoginForm from '@/components/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | AniReserve',
};

export default function LoginPage() {
    return (
        <main className="flex items-center justify-center md:h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/20">
            <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
                <div className="flex w-full items-center justify-center p-6 mb-4 rounded-lg bg-primary text-primary-foreground shadow-lg">
                    <h1 className="text-3xl font-black uppercase tracking-widest">AniReserve</h1>
                </div>
                <LoginForm />
            </div>
        </main>
    );
}
