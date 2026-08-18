import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: {
      fetch: async (request) => {
        calls.push(new URL(request.url).pathname);
        return new Response("asset", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
});

test("falls back to index.html for an unknown app route", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/flow/step-two?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/index.html" ? "app" : "missing", {
            status: url.pathname === "/index.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/flow/step-two?source=share", "/index.html"]);
});

test("does not turn missing API or write requests into the app shell", async () => {
  for (const request of [
    new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }),
    new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }),
  ]) {
    let calls = 0;
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async () => {
          calls += 1;
          return new Response("missing", { status: 404 });
        },
      },
    });

    assert.equal(response.status, 404);
    assert.equal(calls, 1);
  }
});

test("proxies a valid remote image through the same origin", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (request) => {
    assert.equal(new URL(request instanceof Request ? request.url : String(request)).hostname, "images.example.com");
    return new Response("image-bytes", { headers: { "content-type": "image/jpeg" } });
  };
  try {
    const response = await worker.fetch(new Request("https://example.test/api/image-proxy?url=https%3A%2F%2Fimages.example.com%2Fphoto.jpg"), { ASSETS: { fetch: async () => new Response("missing", { status: 404 }) } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/jpeg");
    assert.equal(await response.text(), "image-bytes");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects private and non-image proxy targets", async () => {
  const privateResponse = await worker.fetch(new Request("https://example.test/api/image-proxy?url=http%3A%2F%2F127.0.0.1%2Fsecret"), { ASSETS: { fetch: async () => new Response("missing", { status: 404 }) } });
  assert.equal(privateResponse.status, 400);

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("page", { headers: { "content-type": "text/html" } });
  try {
    const pageResponse = await worker.fetch(new Request("https://example.test/api/image-proxy?url=https%3A%2F%2Fexample.com%2Fpage"), { ASSETS: { fetch: async () => new Response("missing", { status: 404 }) } });
    assert.equal(pageResponse.status, 422);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});
