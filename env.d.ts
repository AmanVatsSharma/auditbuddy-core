declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    REDIS_URL: string;
    AHREFS_API_KEY?: string;
    MOZ_API_KEY?: string;
    GOOGLE_SAFE_BROWSING_KEY?: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
} 