import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveInterests } from "@/lib/onboarding";
import { useAuth } from "@/context/AuthContext";

export function useOnboarding() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { refreshUser } = useAuth();

    const submitInterests = async (interests: string[]) => {
        setLoading(true);

        try {
            await saveInterests({ interests });
            await refreshUser();
            router.push("/");
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        submitInterests,
    };
}