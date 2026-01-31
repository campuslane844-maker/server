"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGoogleToken = void 0;
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const verifyGoogleToken = async (idToken) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error('Invalid token payload');
        }
        return {
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            email_verified: payload.email_verified || false,
        };
    }
    catch (error) {
        throw new Error('Invalid Google token');
    }
};
exports.verifyGoogleToken = verifyGoogleToken;
//# sourceMappingURL=google.js.map