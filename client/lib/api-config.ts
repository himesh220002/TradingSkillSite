const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
// This ensures there is no trailing slash, preventing double-slash errors like "//api"
export const API_BASE_URL = rawUrl.replace(/\/$/, '');
