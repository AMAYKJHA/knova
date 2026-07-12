import { api } from "@/lib/api";

export function followCreator(id: string) {
    return api(`/creator/${id}/follow`, {
        method: "POST",
    });
}

export function unfollowCreator(id: string) {
    return api(`/creator/${id}/follow`, {
        method: "DELETE",
    });
}