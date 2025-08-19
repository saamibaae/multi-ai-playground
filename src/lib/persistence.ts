import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot } from "firebase/firestore";

export type ChatRecord = {
    id?: string;
    createdAt?: unknown;
    title: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
};

const KEY_LOCAL = "multi-ai-chats";

export async function saveChatLocal(chat: ChatRecord) {
    const existing = loadChatsLocal();
    existing.unshift({ ...chat, createdAt: Date.now() });
    localStorage.setItem(KEY_LOCAL, JSON.stringify(existing.slice(0, 50)));
}

export function loadChatsLocal(): ChatRecord[] {
    try {
        const raw = localStorage.getItem(KEY_LOCAL);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export async function saveChatFirestore(userId: string, chat: ChatRecord) {
    if (!db) return; // fallback to local if no firestore
    await addDoc(collection(db, "chats"), {
        userId,
        title: chat.title,
        messages: chat.messages,
        createdAt: serverTimestamp(),
    });
}

export async function loadChatsFirestore(userId: string): Promise<ChatRecord[]> {
    if (!db) return [];
    const q = query(collection(db, "chats"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
        const data = d.data() as { title?: string; messages?: ChatRecord["messages"]; createdAt?: unknown };
        return {
            id: d.id,
            title: data.title || "Untitled",
            messages: data.messages || [],
            createdAt: data.createdAt,
        } satisfies ChatRecord;
    });
}

export function subscribeChatsFirestore(userId: string, onUpdate: (chats: ChatRecord[]) => void) {
    if (!db) return () => { };
    const q = query(collection(db, "chats"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
        q,
        (snapshot) => {
            const list: ChatRecord[] = snapshot.docs.map((d) => {
                const data = d.data() as { title?: string; messages?: ChatRecord["messages"]; createdAt?: unknown };
                return {
                    id: d.id,
                    title: data.title || "Untitled",
                    messages: data.messages || [],
                    createdAt: data.createdAt,
                } satisfies ChatRecord;
            });
            onUpdate(list);
        },
        (error) => {
            // Gracefully handle permission or network errors; fall back to local only
            console.warn("Firestore subscription error:", error?.message || error);
        }
    );
    return unsub;
}


