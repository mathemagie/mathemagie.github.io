const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { buildShareData, buildTwitterUrl } = (() => {
    global.window = { location: { href: "https://example.test/brique/" } };
    global.document = { addEventListener: () => {}, getElementById: () => null, readyState: "complete" };
    global.navigator = {};
    const mod = require(path.join("..", "js", "share.js"));
    return mod;
})();

test("buildShareData includes title, text, and current url", () => {
    const data = buildShareData();
    assert.equal(data.title, "Brick Face");
    assert.ok(data.text.length > 0);
    assert.equal(data.url, "https://example.test/brique/");
});

test("buildTwitterUrl encodes text + url into a tweet intent", () => {
    const url = buildTwitterUrl({ text: "hello world", url: "https://x.test/y" });
    assert.ok(url.startsWith("https://twitter.com/intent/tweet?"));
    assert.ok(url.includes("text="));
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("text"), "hello world https://x.test/y");
});
