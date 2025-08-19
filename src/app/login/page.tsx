"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useSearchParams();
    const nextPath = params.get("next") || "/home";

    useEffect(() => {
        if (user) router.replace(nextPath);
    }, [user, nextPath, router]);

    return (
        <div className="min-h-[100svh] grid place-items-center bg-gradient-to-br from-indigo-500/10 to-pink-500/10">
            <div className="w-full max-w-[420px] rounded-lg border bg-card text-card-foreground shadow-lg p-6 animate-in fade-in-0 slide-in-from-bottom-2">
                <h1 className="text-2xl font-bold mb-2">Welcome</h1>
                <p className="text-muted-foreground mb-6">Sign in to continue</p>
                <button
                    onClick={async () => {
                        try {
                            await signInWithGoogle();
                            router.replace(nextPath);
                        } catch (err) {
                            alert((err as Error).message);
                        }
                    }}
                    className="relative inline-flex items-center justify-center gap-2 w-full py-3 rounded-full border border-border bg-white text-foreground font-semibold overflow-hidden"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.6,6.053,29.083,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.6,6.053,29.083,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.204l-6.198-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.274-7.955 l-6.55,5.047C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.103,5.571c0.001-0.001,0.002-0.001,0.003-0.002 l6.198,5.238C36.255,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>
                    Sign in with Google
                </button>
                <style>{`
          @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
          button:active::after{content:"";position:absolute;inset:-50%;background:radial-gradient(circle,rgba(0,0,0,.15),transparent 40%);animation:ripple .4s ease forwards}
          @keyframes ripple{from{transform:scale(.8);opacity:1}to{transform:scale(1.4);opacity:0}}
        `}</style>
            </div>
        </div>
    );
}


