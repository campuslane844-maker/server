export interface GoogleTokenPayload {
    sub: string;
    email: string;
    name: string;
    picture?: string;
    email_verified: boolean;
}
export declare const verifyGoogleToken: (idToken: string) => Promise<GoogleTokenPayload>;
//# sourceMappingURL=google.d.ts.map