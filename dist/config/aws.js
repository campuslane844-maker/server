"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileUrl = exports.generatePresignedUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
/**
 * Generate a presigned URL for uploading to S3
 */
const generatePresignedUrl = async (key, contentType, expiresIn = 300 // in seconds
) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
    });
    try {
        const url = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn });
        console.log(url);
        return {
            url,
            key,
            expires: new Date(Date.now() + expiresIn * 1000),
        };
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to generate presigned URL");
    }
};
exports.generatePresignedUrl = generatePresignedUrl;
/**
 * Get the public URL for a stored S3 object
 */
const getFileUrl = (key) => {
    return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
exports.getFileUrl = getFileUrl;
//# sourceMappingURL=aws.js.map