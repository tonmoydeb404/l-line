import data from "../data/devicon.json";

// Base CDN URL for Devicons
const DEVICON_CDN_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

export const getLanguageIconUrl = (
  languageId: string,
  preferredVersion: string = "original"
): string => {
  // Find the icon by name or altname
  const icon = data.find(
    (icon) => icon.name === languageId || icon.altnames.includes(languageId)
  );

  if (!icon) {
    return "";
  }

  // Check if preferred version exists
  let version = preferredVersion;
  if (!icon.versions.svg.includes(version)) {
    // Fallback to first available version
    version = icon.versions.svg[0];
  }

  return `${DEVICON_CDN_BASE}/${icon.name}/${icon.name}-${version}.svg`;
};

export const loadLanguageIcon = async (
  languageId: string,
  preferredVersion: string = "original"
): Promise<HTMLImageElement> => {
  const iconUrl = getLanguageIconUrl(languageId, preferredVersion);

  if (!iconUrl) {
    throw new Error(`No icon for ${languageId}`);
  }

  const img = new Image();
  img.crossOrigin = "anonymous";

  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${languageId} icon`));
    img.src = iconUrl;
  });
};
