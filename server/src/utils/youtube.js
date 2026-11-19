const ID_RE = /^[A-Za-z0-9_-]{11}$/;

// Accepts youtu.be/ID, watch?v=ID, embed/ID, shorts/ID, live/ID, or a raw ID.
// Returns the 11-char video ID, or null if invalid.
export function extractYouTubeId(input) {
  if (!input) return null;
  const value = String(input).trim();
  if (ID_RE.test(value)) return value;

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www|m)\./, "");
  let id = null;

  if (host === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0];
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else id = url.pathname.match(/^\/(embed|shorts|live|v)\/([^/]+)/)?.[2];
  }

  return id && ID_RE.test(id) ? id : null;
}
