"use client";

import { useState } from "react";
import * as authApi from "@/lib/auth";
import {
    LoginRequest,
    RegisterRequest,
} from "@/types/authentication";

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function login(data: LoginRequest) {
        try {
            setLoading(true);
            setError("");

            return await authApi.login(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Login failed");
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }

    async function register(data: RegisterRequest) {
        try {
            setLoading(true);
            setError("");

            return await authApi.register(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Registration failed");
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }

    return {
        login,
        register,
        loading,
        error,
    };
}