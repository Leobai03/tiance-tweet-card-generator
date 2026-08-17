import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const categories = [
  { query: "cat:cs.AI", label: "人工智能" },
  { query: "cat:cs.CL", label: "大模型与语言" },
  { query: "cat:cs.HC", label: "AI与人的工作生活" },
  { query: "cat:cs.LG", label: "机器学习" },
];

const officialSources = [
  { name: "OpenAI Newsroom", url: "https://openai.com/news/", type: "官方产品与研究" },
  { name: "OpenAI Academy", url: "https://openai.com/academy/", type: "AI实操教程" },
  { name: "OpenAI Customer Stories", url: "https://openai.com/customer-stories/", type: "商业案例" },
  { name: "OpenAI Research", url: "https://openai.com/research/", type: "研究与世界观" },
  { name: "Anthropic Newsroom", url: "https://www.anthropic.com/news", type: "官方产品与研究" },
  { name: "Anthropic Research", url: "https://www.anthropic.com/research", type: "研究与世界观" },
  { name: "Anthropic Economic Index", url: "https://www.anthropic.com/economic-index", type: "AI与工作商业" },
  { name: "Google DeepMind Research", url: "https://deepmind.google/research/", type: "前沿研究" },
  { name: "Google DeepMind Blog", url: "https://deepmind.google/discover/blog/", type: "AI案例与世界观" },
  { name: "Google AI Blog", url: "https://blog.google/innovation-and-ai/technology/ai/", type: "产品与应用" },
  { name: "Microsoft Research AI", url: "https://www.microsoft.com/en-us/research/research-area/artificial-intelligence/", type: "研究与应用" },
  { name: "NBER Artificial Intelligence", url: "https://www.nber.org/search?page=1&perPage=50&q=artificial%20intelligence", type: "AI生产率与经济" },
  { name: "Stanford HAI", url: "https://hai.stanford.edu/news", type: "AI影响与世界观" },
  { name: "Stanford AI Index", url: "https://hai.stanford.edu/ai-index", type: "AI数据与趋势" },
  { name: "MIT News AI", url: "https://news.mit.edu/topic/artificial-intelligence2", type: "研究与案例" }
];

const decode = (value = "") => value
  .replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">")
  .replaceAll("&quot;", '"').replaceAll("&#39;", "'").replace(/\s+/g, " ").trim();

const field = (entry, tag) => decode(entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1] || "");

async function fetchCategory(category, index) {
  const params = new URLSearchParams({ search_query: category.query, start: "0", max_results: "450", sortBy: "submittedDate", sortOrder: "descending" });
  const response = await fetch(`https://export.arxiv.org/api/query?${params}`, { headers: { "User-Agent": "TianceContentResearch/1.0 (source metadata research)" } });
  if (!response.ok) throw new Error(`arXiv ${category.query}: ${response.status}`);
  const xml = await response.text();
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
  if (index < categories.length - 1) await new Promise((resolveDelay) => setTimeout(resolveDelay, 3200));
  return entries.map((entry) => ({
    id: field(entry, "id").split("/").pop(),
    category: category.label,
    title: field(entry, "title"),
    summary: field(entry, "summary"),
    published: field(entry, "published"),
    updated: field(entry, "updated"),
    sourceName: "arXiv",
    sourceUrl: field(entry, "id"),
    rights: "仅使用公开元数据；发布内容需重新提炼并标注来源"
  }));
}

const groups = [];
for (let index = 0; index < categories.length; index += 1) groups.push(await fetchCategory(categories[index], index));

const unique = new Map();
for (const item of groups.flat()) if (item.id && item.title && !unique.has(item.id)) unique.set(item.id, item);
const candidates = [...unique.values()];
const report = {
  generatedAt: new Date().toISOString(),
  status: "research_candidates_not_yet_integrated",
  candidateCount: candidates.length,
  officialSourceCount: officialSources.length,
  editorialRules: [
    "不整篇复制，只保留元数据并重新提炼观点",
    "涉及模型能力、价格、用户量和收入的数据，发布前回到原文复核",
    "不能把论文结论改写成个人亲历，也不能承诺AI必然带来收入",
    "进入生成器前需做中文相关性、可传播性、重复度和时效性筛选"
  ],
  officialSources,
  candidates
};

const outputDir = resolve("research");
await mkdir(outputDir, { recursive: true });
await writeFile(resolve(outputDir, "ai-source-candidates.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(resolve(outputDir, "ai-source-research-summary.md"), `# AI 素材来源调研\n\n- 候选素材：${candidates.length} 条\n- 官方长期来源：${officialSources.length} 个\n- 状态：只完成检索，尚未集成到生成器\n\n## 论文候选分类\n\n${categories.map((category) => `- ${category.label}：${candidates.filter((item) => item.category === category.label).length} 条`).join("\n")}\n\n## 官方来源\n\n${officialSources.map((source) => `- [${source.name}](${source.url})：${source.type}`).join("\n")}\n\n## 下一步筛选原则\n\n${report.editorialRules.map((rule) => `- ${rule}`).join("\n")}\n`);
console.log(JSON.stringify({ candidateCount: candidates.length, officialSourceCount: officialSources.length }, null, 2));
