import { api } from "@/lib/api";
import { LoginRequest, RegisterRequest } from "@/types/authentication";

export function login(data: LoginRequest) {
    return api("/login", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function register(data: RegisterRequest) {
    return api("/register", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function refresh() {
    return api("/refresh", {
        method: "POST",
    });
}