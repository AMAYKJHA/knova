"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/lib/profile";
import { Profile } from "@/types/profile";

export function useProfile(username: string) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchProfile() {
            try {
                setLoading(true);

                const data = await getProfile(username);

                setProfile(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Unknown error");
                }
            } finally {
                setLoading(false);
            }
        }

        if (username) {
            fetchProfile();
        }
    }, [username]);

    return {
        profile,
        loading,
        error,
    };
}