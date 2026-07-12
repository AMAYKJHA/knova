import { api } from "@/lib/api";

export function getFeed() {
    return api("/posts/feed");
}

export function vote(postId: string, value: number) {
    return api(`/posts/${postId}/vote`, {
        method: "POST",
        body: JSON.stringify({
            value,
        }),
    });
}