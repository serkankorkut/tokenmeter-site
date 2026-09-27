import { readFileSync } from "node:fs";

const key = "4b40472b8b8ecd5f7ebd65ab09aac79a";
const urlList = [...readFileSync("public/sitemap.xml", "utf8").matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: "tokenmeter.fyi", key, keyLocation: `https://tokenmeter.fyi/${key}.txt`, urlList })
});
console.log(res.status, res.statusText, urlList.length, "urls");