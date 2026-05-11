const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });
  const page = await ctx.newPage();

  // Attach response listener BEFORE goto so we capture the first byte
  let capturedBody = null;
  let responseUrl = null;

  page.on("response", async resp => {
    if (capturedBody) return; // already got it
    const url = resp.url();
    if (url.includes("rooms/19683583") && resp.status() === 200 && !url.includes("api")) {
      try {
        const body = await resp.text();
        if (body && body.length > 5000 && body.includes("19683583")) {
          capturedBody = body;
          responseUrl = url;
          console.log("GOT IT! Body len:", body.length, "| URL:", url.substring(0,80));
        }
      } catch(e) {}
    }
  });

  // Navigate with commit - fire and forget
  await page.goto("https://www.airbnb.com/rooms/19683583", { waitUntil: "commit", timeout: 30000 });

  // Wait just 300ms for the response to come back
  await new Promise(r => setTimeout(r, 300));

  if (capturedBody) {
    console.log("Captured body len:", capturedBody.length);
    // Extract og:title
    const ogMatch = capturedBody.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i);
    console.log("og:title:", ogMatch ? ogMatch[1].substring(0, 80) : "not found");
    // Extract og:image(s)
    const imgMatches = capturedBody.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/gi || []);
    console.log("og:image count:", imgMatches.length);
    // Check if it has real listing content (not the generic shell)
    const hasListingSpecific = capturedBody.includes("19683583") && capturedBody.includes("bedroom");
    console.log("Has listing-specific content:", hasListingSpecific);
    if (hasListingSpecific) {
      console.log("SUCCESS - real listing HTML captured!");
      console.log("First 500 chars:", capturedBody.substring(0, 500));
    }
  } else {
    console.log("No body captured yet");
  }

  await browser.close();
})();
