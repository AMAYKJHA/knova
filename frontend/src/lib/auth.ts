import { api } from "@/lib/api";
import { LoginRequest, RegisterRequest, AuthResponse, } from "@/types/authentication";

export function login(data: LoginRequest) {
    return api<AuthResponse>("/login", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function register(data: RegisterRequest) {
    return api<AuthResponse>("/register", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function refresh() {
    return api<AuthResponse>("/refresh", {
        method: "POST",
    });
}