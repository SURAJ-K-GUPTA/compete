/**
 * Environment configuration manager
 * Validates and provides type-safe access to environment variables
 */
export const getEnvironmentVariable = (key: keyof NodeJS.ProcessEnv): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};

export const config = {
  openai: {
    apiKey: getEnvironmentVariable('OPENAI_API_KEY'),
  },
} as const; 