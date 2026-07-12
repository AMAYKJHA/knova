import { api } from "@/lib/api";
import { Profile } from "@/types/profile";

export function getProfile(username: string) {
    return api<Profile>(`/users/${username}`);
}