import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const inputPath = process.argv[2];
if (!inputPath) throw new Error("Usage: node scripts/extract-feishu-materials.mjs <lark-fetch.json>");
const payload = JSON.parse(await readFile(resolve(inputPath), "utf8"));
const markdown = payload?.data?.document?.content;
if (!markdown) throw new Error("No document content found in lark fetch result");

const normalize = (value) => value
  .replace(/^# .*$/gm, "")
  .replace(/^---$/gm, "")
  .replace(/\[(.*?)\]\([^)]*\)/g, "$1")
  .replace(/[ \t]+/g, " ")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const raw = markdown.split(/\n{4,}/).map(normalize).filter((item) => item.length >= 12);
const grouped = [];
for (const part of raw) {
  const isListContinuation = /^(?:\d+[.、]|[-*] )/.test(part);
  const last = grouped.at(-1);
  if (last && (isListContinuation || last.endsWith("：") || last.endsWith(":") || last.length < 38) && last.length + part.length < 900) {
    grouped[grouped.length - 1] = `${last}\n\n${part}`;
  } else {
    grouped.push(part);
  }
}

const hardRiskPatterns = [
  /砍下头颅|肉体上进行消灭|支付宝里有多少钱|闻到.*余额/,
  /日入百万|稳赚|包赚|保守估计.*千万|无限.*财富/,
  /整体收益.*\d|营收.*\d|成交.*\d+[万wW]|卖到最终.*\d+[万wW]/,
  /(?:水光针|玻尿酸|减肥|医美|贷款|保险).*(?:副作用|办法|客户|采购|成交)/
];
const needsCurrentVerification = /GPT-?\d|202\d年|目前|现在|未来.*只能|唯一|第一|国家大方向|价格|收入|营收|收益|成交|客户.*家|每天消耗的token金额/i;

function categoryFor(text) {
  if (/token|中转|算力|模型调用/i.test(text)) return "飞书·Token";
  if (/AI|GPT|Claude|Codex|agent|智能体|skill|prompt|workflow/i.test(text)) return "飞书·AI认知";
  if (/短视频|自媒体|流量|内容|写作|朋友圈|创作|抖音|小红书/.test(text)) return "飞书·内容";
  if (/创业|商业|产品|客户|需求|销售|赚钱|老板|业务/.test(text)) return "飞书·创业";
  if (/执行|行动|完美主义|拖延|学习|系统|SOP|复盘|时间/.test(text)) return "飞书·行动";
  return "飞书·世界观";
}

function productFitFor(category) {
  if (category === "飞书·Token") return ["Token"];
  if (category === "飞书·AI认知") return ["GPT", "Token"];
  if (category === "飞书·内容") return ["社群", "GPT"];
  if (category === "飞书·创业") return ["社群", "Token"];
  return ["社群"];
}

function titleFor(text) {
  const first = text.split(/\n|[。！？]/).map((item) => item.trim()).find((item) => item.length >= 6) || text;
  return first.length > 42 ? `${first.slice(0, 42)}…` : first;
}

const excluded = [];
const materials = [];
for (const text of grouped) {
  if (text.startsWith("这个板块记录的是一个AI创业者")) continue;
  const matchedRisk = hardRiskPatterns.find((pattern) => pattern.test(text));
  if (matchedRisk) {
    excluded.push({ text: text.slice(0, 160), reason: String(matchedRisk) });
    continue;
  }
  const category = categoryFor(text);
  const verificationNote = needsCurrentVerification.test(text)
    ? "原文含时效性、绝对化或动态事实，发布前必须核实并改成当前真实情况。"
    : "发布前检查语气和事实，个人经历只按真实情况使用。";
  const index = materials.length + 1;
  materials.push({
    id: `feishu-core-${String(index).padStart(4, "0")}`,
    category,
    title: titleFor(text),
    insight: text.length > 150 ? `${text.slice(0, 150)}…` : text,
    angle: "来自天策核心内容文档，可保留原观点，也可结合自己的真实经历改成口播。",
    action: verificationNote,
    draft: text,
    sourceName: "天策核心内容｜飞书知识库",
    sourceUrl: "https://xcnkl208r114.feishu.cn/wiki/JK6Xw8ocQiCpBbk5rFscAZk8nHd",
    productFit: productFitFor(category),
    priority: 90,
    requiresVerification: needsCurrentVerification.test(text),
    origin: "用户授权提取的飞书内容；已做基础发布风险筛选"
  });
}

await writeFile(resolve("src/feishu-content-sources.json"), `${JSON.stringify(materials, null, 2)}\n`);
await writeFile(resolve("research/feishu-content-extraction-report.json"), `${JSON.stringify({
  documentId: payload.data.document.document_id,
  revisionId: payload.data.document.revision_id,
  rawBlocks: raw.length,
  groupedBlocks: grouped.length,
  included: materials.length,
  excluded: excluded.length,
  excludedSamples: excluded.slice(0, 30)
}, null, 2)}\n`);
console.log(JSON.stringify({ rawBlocks: raw.length, groupedBlocks: grouped.length, included: materials.length, excluded: excluded.length }, null, 2));
