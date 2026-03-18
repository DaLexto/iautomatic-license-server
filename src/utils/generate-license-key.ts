// Generate a random iAutomatic license key (IAUTO-XXXXX-XXXXX-XXXXX-XXXXX)
export function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const createPart = (length: number): string => {
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }

    return result;
  };

  return `IAUTO-${createPart(5)}-${createPart(5)}-${createPart(5)}-${createPart(5)}`;
}