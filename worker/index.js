export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    if (requestUrl.pathname === "/api/image-proxy") {
      if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });
      const source = requestUrl.searchParams.get("url");
      let imageUrl;
      try {
        imageUrl = new URL(source);
        if (!["http:", "https:"].includes(imageUrl.protocol) || isPrivateHost(imageUrl.hostname)) throw new Error("invalid URL");
      } catch {
        return new Response("Invalid image URL", { status: 400 });
      }

      try {
        const upstream = await fetch(imageUrl, {
          headers: {
            Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "User-Agent": "Mozilla/5.0 (compatible; TianceTweetCard/1.0)",
            Referer: `${imageUrl.protocol}//${imageUrl.host}/`,
          },
          redirect: "follow",
        });
        const contentType = upstream.headers.get("content-type") || "";
        if (!upstream.ok || !contentType.toLowerCase().startsWith("image/")) {
          return new Response("The URL did not return an image", { status: 422 });
        }
        return new Response(upstream.body, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch {
        return new Response("Unable to load remote image", { status: 502 });
      }
    }

    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");

    if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    const indexUrl = new URL(request.url);
    indexUrl.pathname = "/index.html";
    indexUrl.search = "";
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};

function isPrivateHost(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host === "0.0.0.0" || host === "::1") return true;
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host)) return true;
  const match = host.match(/^172\.(\d+)\./);
  return Boolean(match && Number(match[1]) >= 16 && Number(match[1]) <= 31);
}
