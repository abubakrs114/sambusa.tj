const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

function withDefaultExtension(filename: string): string {
  const trimmed = filename.trim();
  if (!trimmed) return trimmed;
  return IMAGE_EXT.test(trimmed) ? trimmed : `${trimmed}.png`;
}

/**
 * Путь для Next.js Image: только /img/..., /uploads/... или https://...
 * Превращает Windows-пути и public/img/... в веб-путь от корня сайта.
 */
export function normalizeProductImageUrl(raw: string | undefined): string | undefined {
  if (raw === undefined || raw === null) return undefined;

  let value = String(raw).trim();
  if (!value) return undefined;

  if (/^https?:\/\//i.test(value)) return value;

  const fromPublic = value.match(/[/\\]public[/\\](img|uploads)[/\\]([^/\\?#]+)/i);
  if (fromPublic) {
    const folder = fromPublic[1].toLowerCase();
    return `/${folder}/${withDefaultExtension(fromPublic[2])}`;
  }

  const fromImg = value.match(/[/\\]img[/\\]([^/\\?#]+)$/i);
  if (fromImg) {
    return `/img/${withDefaultExtension(fromImg[1])}`;
  }

  const fromUploads = value.match(/[/\\]uploads[/\\]([^/\\?#]+)$/i);
  if (fromUploads) {
    return `/uploads/${withDefaultExtension(fromUploads[1])}`;
  }

  value = value.replace(/\\/g, "/");

  if (value.startsWith("public/")) {
    value = `/${value.slice("public/".length)}`;
  }

  if (!value.startsWith("/")) {
    if (value.startsWith("img/") || value.startsWith("uploads/")) {
      value = `/${value}`;
    }
  }

  if (/^\/(img|uploads)\/[^/\\]+$/i.test(value)) {
    return value;
  }

  if (value.startsWith("/") && !value.includes("://") && !value.includes("\\")) {
    const segments = value.split("/").filter(Boolean);
    if (segments.length >= 2 && (segments[0] === "img" || segments[0] === "uploads")) {
      return `/${segments.join("/")}`;
    }
  }

  return undefined;
}

export function isValidProductImageUrl(url: string | undefined): url is string {
  if (!url) return false;
  if (/^https?:\/\//i.test(url)) return true;
  return /^\/(img|uploads)\/.+/i.test(url) && !url.includes("\\");
}
