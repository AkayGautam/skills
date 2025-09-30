export function parseNullable(val) {
  if (val === undefined || val === null) return null;
  if (typeof val === "string") {
    const s = val.trim();
    if (s === "" || s.toLowerCase() === "null") return null;
  }
  return val;
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') 
    .replace(/[^a-z0-9\-]/g, '') 
    .replace(/\-+/g, '-'); 
}