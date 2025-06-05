export interface User {
    _id: string;
    email: string;
    username: string;
    password: string;
    isTwoFactorEnabled: boolean;
    twoFactorSecret?: string;
    createdAt: Date;
    updatedAt: Date;
}

// For API responses, we'll use this type that maps _id to id and makes password optional
export type UserResponse = Omit<User, '_id' | 'password'> & { id: string };

export interface UserInput {
    email: string;
    username: string;
    password: string;
}

export interface AuthPayload {
    token: string;
    user: Omit<UserResponse, 'twoFactorSecret'>;
} 