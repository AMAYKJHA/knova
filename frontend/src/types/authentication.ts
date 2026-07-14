export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
}

export interface AuthUser {
    id: string;
    email: string;
    username: string;
    avatar_url: string | null;
    onboarding_completed: boolean;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: AuthUser;
}
