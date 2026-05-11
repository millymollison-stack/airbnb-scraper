const fs = require("fs");
const { execSync } = require("child_process");
const r = execSync(["curl", "-s", "--max-time", "15",
  "-H", "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "-H", "Accept-Language: en-US,en;q=0.9",
  "-H", "sec-fetch-site: none",
  "-H", "sec-fetch-mode: navigate",
  "-H", "sec-fetch-dest: document",
  "https://www.airbnb.com/rooms/40551862"
].join(" "), { encoding: "utf8" });
const html = r;
const m = html.match(/<script[^>]+id="data-deferred-state-0"[^>]*>([^<]+)<\/script/i);
if (m) {
  const dstate = JSON.parse(m[1]);
  const keyStr = dstate.niobeClientData[0][0];
  const val = dstate.niobeClientData[0][1];
  console.log("niobeClientData val keys:", Object.keys(val));
  console.log("niobeClientData val:", JSON.stringify(val).substring(0, 500));
  const dataKeys = Object.keys(val.data || {});
  console.log("data keys:", dataKeys);
}
fs.writeFileSync("/tmp/test-niobe.js", code);
