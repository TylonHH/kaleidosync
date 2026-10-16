const base = "https://api.audius.co/v1";
async function read(path) {
  const response = await fetch(`${base}${path}${path.includes("?") ? "&" : "?"}app_name=Kaleidosync`, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Audius is temporarily unavailable");
  return (await response.json()).data;
}
export async function audiusData(action, id) {
  id = encodeURIComponent(id || "");
  switch (action) {
    case "trending": {
      const [tracks, playlists] = await Promise.all([read("/tracks/trending?limit=20&time=week"), read("/playlists/trending?limit=20&time=week")]);
      return { tracks: { week: tracks }, playlists: { week: playlists } };
    }
    case "search": return read(`/tracks/search?query=${id}&limit=20`);
    case "playlists": {
      const [playlists, tracks] = await Promise.all([read(`/playlists/${id}`), read(`/playlists/${id}/tracks?limit=100`)]);
      return { ...playlists[0], tracks };
    }
    case "users": {
      const user = await read(`/users/handle/${id}`);
      const userId = encodeURIComponent(user.id);
      const [tracks, playlists, albums] = await Promise.all([read(`/users/${userId}/tracks?limit=100`),
        read(`/users/${userId}/playlists?limit=100`), read(`/users/${userId}/albums?limit=100`)]);
      return { ...user, tracks, playlists, albums };
    }
    case "stream": return { url: `${base}/tracks/${id}/stream?app_name=Kaleidosync` };
    default: return null;
  }
}
