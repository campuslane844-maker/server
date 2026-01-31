/**
 * Generate a presigned URL for uploading to S3
 */
export declare const generatePresignedUrl: (key: string, contentType: string, expiresIn?: number) => Promise<{
    url: string;
    key: string;
    expires: Date;
}>;
/**
 * Get the public URL for a stored S3 object
 */
export declare const getFileUrl: (key: string) => string;
//# sourceMappingURL=aws.d.ts.map