const { chromium } = require("playwright");
const fs = require("node:fs");

const targetUrl = process.argv[2] || "https://juan-velasquez-tecnoideas.github.io/mockups/";
const outputDir = process.argv[3] || "/private/tmp/geohashes-responsive";
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop", width: 1024, height: 768 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

async function layoutState(page, screen) {
  return page.evaluate((screenName) => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };

    const offenders = [...document.querySelectorAll("body *")]
      .filter(visible)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id,
          className: typeof element.className === "string" ? element.className : "",
          left: Math.round(rect.left),
          right: Math.round(rect.right),
        };
      })
      .filter((item) => item.left < -2 || item.right > window.innerWidth + 2)
      .slice(0, 12);

    return {
      screen: screenName,
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      offenders,
    };
  }, screen);
}

async function click(page, selector) {
  await page.locator(selector).click();
  await page.waitForTimeout(100);
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const consoleErrors = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(`${viewport.name}: ${message.text()}`);
    });

    await page.goto(`${targetUrl}?responsive=${Date.now()}`, { waitUntil: "networkidle" });
    results.push(await layoutState(page, `${viewport.name}:corporate`));

    await click(page, "#corpLoginBtn");
    results.push(await layoutState(page, `${viewport.name}:login`));

    await click(page, "#detektorLoginBtn");
    results.push(await layoutState(page, `${viewport.name}:hub`));

    await click(page, "#managerBtn");
    results.push(await layoutState(page, `${viewport.name}:manager`));
    await click(page, "#managerCloseBtn");

    await click(page, "#argosCardBtn");
    for (const view of ["zonas", "divipoles", "plantas", "vehiculos", "geocercas"]) {
      if (view !== "zonas") await click(page, `[data-view="${view}"]`);
      results.push(await layoutState(page, `${viewport.name}:argos:${view}`));
      if (view === "zonas" || view === "geocercas") {
        await page.screenshot({ path: `${outputDir}/${viewport.name}-${view}.png`, fullPage: true });
      }
    }

    await click(page, '[data-view="zonas"]');
    await click(page, '[data-open-modal="zoneModal"]');
    results.push(await layoutState(page, `${viewport.name}:city-modal`));
    await page.screenshot({ path: `${outputDir}/${viewport.name}-city-modal.png`, fullPage: true });

    await context.close();
  }

  await browser.close();
  const report = { results, consoleErrors };
  const failures = results.filter((result) => result.horizontalOverflow);
  fs.writeFileSync(`${outputDir}/results.json`, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ checked: results.length, failures, consoleErrors }, null, 2));
  if (failures.length || consoleErrors.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
