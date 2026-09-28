import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

const site = process.env.SITE_URL ?? "https://tokenmeter.fyi";
const version = JSON.parse(readFileSync("../tokenmeter/pyproject.toml", "utf8").match(/version = "([^"]+)"/) ? `"${readFileSync("../tokenmeter/pyproject.toml", "utf8").match(/version = "([^"]+)"/)[1]}"` : '"0.2.0"');
const author = { "@type": "Person", "@id": "https://serkan.fyi/#person", name: "Serkan Korkut", url: "https://serkan.fyi/", sameAs: ["https://www.linkedin.com/in/korkutserkan/", "https://github.com/serkankorkut", "https://medium.com/@serkankorkut"] };
const app = {
  "@type": "SoftwareApplication",
  "@id": `${site}/#app`,
  name: "Tokenmeter",
  alternateName: "tokenmeter-dashboard",
  url: `${site}/`,
  keywords: "Claude Code token usage, Claude Code cost, Claude Code usage dashboard, Codex token usage, Copilot CLI usage, LLM cost tracking",
  sameAs: ["https://github.com/serkankorkut/tokenmeter", "https://pypi.org/project/tokenmeter-dashboard/", "https://github.com/serkankorkut/homebrew-tap"],
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Linux, Windows",
  softwareVersion: version,
  license: "https://opensource.org/licenses/MIT",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description: "A local dashboard that shows token usage, cost, cache misses and rate-limit windows for every prompt in Claude Code, Codex and GitHub Copilot CLI. Nothing leaves your machine.",
  author,
  downloadUrl: "https://pypi.org/project/tokenmeter-dashboard/",
  codeRepository: "https://github.com/serkankorkut/tokenmeter"
};
const website = { "@type": "WebSite", "@id": `${site}/#website`, name: "Tokenmeter", url: `${site}/`, inLanguage: "en" };
const layout = readFileSync("src/layout.html", "utf8");
const logo = readFileSync("src/logo.svg", "utf8");
const mark = readFileSync("src/mark.svg", "utf8");
rmSync("public", { recursive: true, force: true });
cpSync("src/static", "public", { recursive: true });
const urls = [];
for (const file of readdirSync("src/pages")) {
  const raw = readFileSync(join("src/pages", file), "utf8");
  const meta = Object.fromEntries([...raw.matchAll(/^<!--\s*(\w+):\s*(.*?)\s*-->$/gm)].map(m => [m[1], m[2]]));
  const content = raw.replace(/^<!--\s*\w+:.*?-->\n?/gm, "").trim().replaceAll("{{version}}", version);
  const slug = file.replace(/\.html$/, "");
  const path = slug === "index" ? "/" : slug === "404" ? "/404.html" : `/${slug}/`;
  const out = path === "/404.html" ? "public/404.html" : `public${path}index.html`;
  const url = site + path;
  const page = { "@type": meta.type ?? "WebPage", "@id": url, url, name: meta.title, description: meta.description, isPartOf: { "@id": website["@id"] }, about: { "@id": app["@id"] }, inLanguage: "en" };
  const modified = execFileSync("git", ["log", "-1", "--format=%cs", "--", join("src/pages", file)]).toString().trim() || new Date().toISOString().slice(0, 10);
  if (page["@type"] === "TechArticle") Object.assign(page, { headline: meta.title, datePublished: meta.date, dateModified: modified, author, publisher: author, image: `${site}/og.png`, mainEntityOfPage: url });
  const graph = [website, app, page];
  const faq = content.match(/<section class="[^"]*\bfaq\b[^"]*">[\s\S]*?<\/section>/)?.[0];
  if (faq) graph.push({ "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: [...faq.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)].map(([, q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") } })) });
  if (path !== "/" && slug !== "404") graph.push({ "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${site}/` },
    { "@type": "ListItem", position: 2, name: meta.crumb ?? meta.title.split(" — ")[0], item: url }
  ] });
  const html = layout
    .replaceAll("{{title}}", meta.title)
    .replaceAll("{{description}}", meta.description)
    .replaceAll("{{url}}", url)
    .replaceAll("{{site}}", site)
    .replaceAll("{{version}}", version)
    .replace("{{robots}}", slug === "404" ? "noindex,follow" : "index,follow,max-image-preview:large,max-snippet:-1")
    .replace("{{jsonld}}", JSON.stringify({ "@context": "https://schema.org", "@graph": graph }))
    .replaceAll(`<a href="${path}"`, `<a href="${path}" aria-current="page"`)
    .replace("{{content}}", content)
    .replaceAll("{{logo}}", logo)
    .replaceAll("{{mark}}", mark);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  if (slug !== "404") urls.push([url, modified]);
}
writeFileSync("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, d]) => `  <url><loc>${u}</loc><lastmod>${d}</lastmod></url>`).join("\n")}\n</urlset>`);
writeFileSync("public/robots.txt", readFileSync("src/static/robots.txt", "utf8").replace("{{site}}", site));
console.log(`built ${urls.length} pages (v${version}) -> public/`);