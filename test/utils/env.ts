import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

export function getEnvVar(parameter: string, defaultValue?: string): string {
  const envVar = process.env[parameter];
  if (!envVar && defaultValue) {
    return defaultValue;
  } else if (!envVar) {
    throw new Error(`Environment variable not found: ${parameter}`);
  }

  return envVar;
}
