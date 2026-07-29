/**
 * Centralized utility for resolving configuration values from Nuxt runtimeConfig or process.env.
 */
export function getEnvOrConfig(configKey: string, envKey: string): string {
  try {
    const config = useRuntimeConfig();
    const val = config[configKey as keyof typeof config];
    if (typeof val === "string" && val.trim().length > 0) {
      return val.trim();
    }
  } catch {
    // runtimeConfig not available (e.g. outside Nuxt context)
  }
  const envVal = process.env[envKey];
  return typeof envVal === "string" ? envVal.trim() : "";
}
