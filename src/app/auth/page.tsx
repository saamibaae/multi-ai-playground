"use client";
import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  async function google() {
    if (!auth) return;
    await signInWithPopup(auth, googleProvider);
  }
  async function emailAuth() {
    if (!auth) return;
    if (mode === "signin") {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
  }
  async function doSignOut() {
    if (!auth) return;
    await signOut(auth);
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold">Authentication</h1>
      <div className="mt-4 grid gap-3">
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex items-center gap-2">
          <Button onClick={emailAuth}>{mode === "signin" ? "Sign in" : "Sign up"}</Button>
          <Button variant="outline" onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}>{mode === "signin" ? "Need an account?" : "Have an account?"}</Button>
        </div>
        <Button variant="outline" onClick={google}>Continue with Google</Button>
        <Button variant="ghost" onClick={doSignOut}>Sign out</Button>
      </div>
    </main>
  );
}


