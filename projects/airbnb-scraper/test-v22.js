const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    extraHTTPHeaders: {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "sec-fetch-site": "none",
      "sec-fetch-mode": "navigate",
      "sec-fetch-dest": "document"
    }
  });
  const page = await ctx.newPage();

  let capturedHtml = null;
  const targetUrl = "https://www.airbnb.com/rooms/19683583";

  page.on("response", async resp => {
    if (capturedHtml) return;
    const url = resp.url();
    if (url === targetUrl && resp.status() === 200 && !url.includes("/api/")) {
      try {
        const body = await resp.text();
        console.log("Response body len:", body.length, "| URL:", url.substring(0,80));
        console.log("Has listing ID:", body.includes("19683583"));
        console.log("Has bedroom:", body.includes("bedroom"));
        if (body && body.length > 100000 && body.includes("19683583")) {
          capturedHtml = body;
          console.log("CAPTURED!");
          const ogMatch = body.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i);
          console.log("og:title:", ogMatch ? ogMatch[1].substring(0, 80) : "not found");
        }
      } catch(e) { console.log("Error:", e.message); }
    }
  });

  await page.goto(targetUrl, { waitUntil: "commit", timeout: 15000 });

  let waited = 0;
  while (!capturedHtml && waited < 5000) {
    await new Promise(r => setTimeout(r, 200));
    waited += 200;
  }

  if (!capturedHtml) {
    console.log("NOT captured after 5s | URL:", page.url());
  } else {
    console.log("Final captured HTML len:", capturedHtml.length);
  }

  await browser.close();
})();
