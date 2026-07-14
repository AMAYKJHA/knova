"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { login as apiLogin, register as apiRegister, logout as apiLogout } from "@/lib/auth";
import { api } from "@/lib/api";
import { AuthUser, LoginRequest, RegisterRequest } from "@/types/authentication";

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const ONBOARDING_ROUTE = "/onboarding";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ["/login", "/register", "/about", "/help", "/contact"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchCurrentUser = async () => {
        try {
            const data = await api<AuthUser>("/api/v1/users/me");
            setUser(data);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    // Route guard
    useEffect(() => {
        if (!loading) {
            const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
            if (!user && !isPublicRoute) {
                router.push("/login");
            } else if (user && (pathname === "/login" || pathname === "/register")) {
                router.push(user.onboarding_completed ? "/" : ONBOARDING_ROUTE);
            } else if (user && !user.onboarding_completed && pathname !== ONBOARDING_ROUTE && !pathname.startsWith("/api")) {
                router.push(ONBOARDING_ROUTE);
            }
        }
    }, [user, loading, pathname, router]);

    const login = async (data: LoginRequest) => {
        const response = await apiLogin(data);
        setUser(response.user);
    };

    const register = async (data: RegisterRequest) => {
        const response = await apiRegister(data);
        setUser(response.user);
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch (err) {
            console.error("Logout request failed:", err);
        } finally {
            setUser(null);
            router.push("/login");
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: fetchCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
