export function getAllowedWebOrigins(): string[] {
  const configuredOrigins =
    process.env.WEB_ORIGINS ?? process.env.WEB_ORIGIN ?? "http://localhost:3000";

  return configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
