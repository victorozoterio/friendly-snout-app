export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
export const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? '';

export const CLOUDFLARE_CONFIG = {
  endpoint:
    process.env.EXPO_PUBLIC_CLOUDFLARE_ENDPOINT ?? 'https://ff7cc565562785a54fbeca604f9fd907.r2.cloudflarestorage.com',
  publicUrl: process.env.EXPO_PUBLIC_CLOUDFLARE_PUBLIC_URL ?? 'https://r2-dev.focinhoamigo.com.br',
  bucketName: process.env.EXPO_PUBLIC_CLOUDFLARE_BUCKET_NAME ?? 'friendly-snout',
};
