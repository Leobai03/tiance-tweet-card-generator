import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  ArrowsClockwise, BookmarkSimple, ChartBar, Check, ChatCircle, CopySimple,
  DownloadSimple, DotsThree, Heart, ImageSquare, LinkSimple, MagnifyingGlass,
  Repeat, SealCheck, ShieldCheck, Shuffle, Sparkle, UploadSimple, WarningCircle,
} from "@phosphor-icons/react";
import tweets from "./tweets.json";
import baseContentSources from "./content-sources.json";
import feishuContentSources from "./feishu-content-sources.json";

function interleaveContentSources(featured, base) {
  const mixed = [];
  const basePerFeatured = 2;
  for (let index = 0; index < Math.max(featured.length, Math.ceil(base.length / basePerFeatured)); index += 1) {
    if (featured[index]) mixed.push(featured[index]);
    mixed.push(...base.slice(index * basePerFeatured, index * basePerFeatured + basePerFeatured));
  }
  return mixed;
}

const contentSources = interleaveContentSources(feishuContentSources, baseContentSources);

const avatar = "/assets/tiance-avatar.jpg";
const initialTweet = tweets.find((tweet) => tweet.id === "2000941227961733492") || tweets[0];
const backgrounds = [
  { id: "city-1", name: "香港海边", tags: "香港 城市 海边 蓝天", src: "/backgrounds/city-1.jpg" },
  { id: "city-2", name: "城市天际线", tags: "香港 城市 天际线 日落", src: "/backgrounds/city-2.jpg" },
  { id: "city-3", name: "街头夜景", tags: "城市 街头 夜景 情绪", src: "/backgrounds/city-3.jpg" },
  { id: "city-4", name: "山海风景", tags: "自然 山 海 风景", src: "/backgrounds/city-4.jpg" },
  { id: "hk-day", name: "香港港口", tags: "香港 港口 白天 城市", src: "/backgrounds/hk-harbor-day.jpg" },
  { id: "hk-mountain", name: "山城天际线", tags: "香港 山 城市 天际线", src: "/backgrounds/hk-mountain-city.jpg" },
  { id: "neon-street", name: "霓虹街头", tags: "城市 夜景 霓虹 街头 情绪", src: "/backgrounds/neon-street.jpg" },
  { id: "hk-aerial", name: "香港俯瞰夜景", tags: "香港 俯瞰 夜景 灯光", src: "/backgrounds/hk-aerial-night.jpg" },
  { id: "hk-night", name: "维港夜景", tags: "香港 维多利亚港 夜景 倒影", src: "/backgrounds/hk-harbor-night.jpg" },
  { id: "tower-night", name: "城市高楼", tags: "城市 高楼 夜景 竖图", src: "/backgrounds/city-tower-night.jpg" },
  { id: "hk-peak", name: "太平山夜景", tags: "香港 太平山 夜景 天际线", src: "/backgrounds/hk-peak-night.jpg" },
  { id: "aurora", name: "极光流动", tags: "AI 科技 极光 蓝紫 抽象", src: "/backgrounds/generated-aurora.svg" },
  { id: "sunset", name: "日落山丘", tags: "日落 山丘 橙色 自然", src: "/backgrounds/generated-sunset.svg" },
  { id: "ocean", name: "深海微光", tags: "海洋 蓝色 微光 安静", src: "/backgrounds/generated-ocean.svg" },
  { id: "paper", name: "暖色纸张", tags: "纸张 米色 极简 认知", src: "/backgrounds/generated-paper.svg" },
  { id: "grid", name: "未来网格", tags: "AI 科技 网格 黑色 未来", src: "/backgrounds/generated-grid.svg" },
  { id: "forest", name: "雾中森林", tags: "森林 绿色 雾 自然", src: "/backgrounds/generated-forest.svg" },
  { id: "dawn", name: "城市清晨", tags: "城市 清晨 粉色 天空", src: "/backgrounds/generated-dawn.svg" },
  { id: "ink", name: "水墨山水", tags: "水墨 山水 黑白 中国风", src: "/backgrounds/generated-ink.svg" },
  { id: "neon", name: "霓虹渐变", tags: "霓虹 紫色 蓝色 AI 抽象", src: "/backgrounds/generated-neon.svg" },
  { id: "desert", name: "沙漠光影", tags: "沙漠 金色 光影 自然", src: "/backgrounds/generated-desert.svg" },
  { id: "cloud", name: "云上蓝天", tags: "蓝天 云朵 清新 自由", src: "/backgrounds/generated-cloud.svg" },
  { id: "matrix", name: "矩阵光线", tags: "矩阵 光线 绿色 黑色 科技", src: "/backgrounds/generated-matrix.svg" },
];

function formatDate(value) {
  const date = new Date(`${value}T00:00:00+08:00`);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
function formatMetric(value) {
  if (value === null || value === undefined) return "—";
  if (value >= 10000) {
    const amount = value / 10000;
    return `${amount >= 100 ? Math.round(amount) : amount.toFixed(amount < 10 ? 1 : 0)}万`;
  }
  return value.toLocaleString("zh-CN");
}
function getAdaptiveFontSize(text, preferred, poster = false) {
  const length = text.replace(/\s+/g, "").length;
  const limit = poster
    ? length > 900 ? 11 : length > 700 ? 12 : length > 520 ? 13 : length > 360 ? 15 : length > 220 ? 17 : preferred
    : length > 1000 ? 13 : length > 720 ? 14 : length > 480 ? 15 : length > 300 ? 16 : length > 180 ? 17 : preferred;
  return Math.min(preferred, limit);
}
function cleanSentence(value) {
  return value.replace(/https?:\/\/\S+/g, "").split(/[。！？\n]/).map((item) => item.trim()).find((item) => item.length >= 8 && item.length <= 52);
}
const rewriteStyles = [
  { id: "auto", label: "自动换风格" },
  { id: "efficiency", label: "效率对比" },
  { id: "era", label: "时代判断" },
  { id: "practice", label: "具体实操" },
  { id: "cognition", label: "认知反转" },
  { id: "life", label: "生活场景" },
  { id: "codex", label: "Codex工作流" },
  { id: "token", label: "Token自动化" },
];

function createDraft(source, style = "auto", variant = 0) {
  const anchor = cleanSentence(source.text) || "真正重要的不是听懂一个道理，而是把它放进现实里检验";
  const styleIds = rewriteStyles.slice(1).map((item) => item.id);
  const resolved = style === "auto" ? styleIds[variant % styleIds.length] : style;
  const templates = {
    efficiency: [
      `以前看到“${anchor}”，很多人会先花几个小时找资料、列提纲、反复修改。\n\n现在可以换个顺序：把背景、目标和限制交给AI，让它先完成搜索、整理和第一版。人只负责判断哪里不对、哪里值得继续。\n\nAI真正省下来的，不是几分钟打字时间，而是从空白到能动手的那段路。`,
      `“${anchor}”这件事，放到今天可以再往前走一步。\n\n凡是重复搜索、整理、归类和改格式的工作，都可以先让AI跑一遍。你不需要把判断交出去，只需要少做那些没有必要的机械劳动。\n\n同样一天，有人还在从零开始，有人已经拿着AI的初稿做第二轮了。`,
    ],
    era: [
      `“${anchor}。”\n\n这句话放在AI时代，会变得更现实。答案正在越来越便宜，真正拉开差距的，是谁能提出具体问题、验证结果，再把有效做法沉淀下来。\n\n以后不会是AI淘汰所有人，更可能是会调用AI完成工作的人，慢慢替代只会用旧方法重复劳动的人。`,
      `AI带来的变化，不只是多了一个聊天工具。\n\n“${anchor}。”过去这类判断可能只能停在脑子里，现在普通人可以马上让AI帮自己研究、拆解、写出第一版，再拿到现实里验证。\n\n时代变化最明显的地方，就是想法到结果之间的距离正在变短。`,
    ],
    practice: [
      `如果你认同“${anchor}”，不要只收藏。\n\n今天找一个真实任务，把这四样东西一次发给AI：\n1. 事情的背景\n2. 你想得到的结果\n3. 不能碰的边界\n4. 最终交付格式\n\n先让它做出第一版，再逐条检查。AI好不好用，做完一个任务就知道了。`,
      `拿“${anchor}”做一次AI实验。\n\n先让AI反驳这个观点，再让它补充证据，最后要求它给出一个今天能执行的小动作。不要问“你怎么看”，要让它交付一个可以检查的结果。\n\n会不会用AI，不看提示词收藏了多少，只看有没有完成闭环。`,
    ],
    cognition: [
      `很多人以为AI最值钱的是答案。\n\n其实答案越容易得到，“${anchor}”这种判断反而越需要人自己负责。AI可以给你十种解释，却不能替你决定相信哪一种，更不能替你承担结果。\n\n未来更稀缺的可能不是知识，而是提问、判断和行动。`,
      `“${anchor}。”\n\nAI不会让思考变得不重要，恰恰相反。它会迅速生成一堆看起来都对的东西，逼着人分辨什么是真的、什么适合自己。\n\n模型负责扩大选项，人负责收敛选择。这才是比较舒服的人机分工。`,
    ],
    life: [
      `AI改变生活，通常不是从一件很宏大的事开始。\n\n可能只是读一份看不懂的文件、比较几个选择、整理一次旅行计划，或者把“${anchor}”解释成自己听得懂的话。\n\n当这些小事不再持续消耗注意力，人才能把时间留给更重要的人和决定。`,
      `“${anchor}。”\n\n以前遇到复杂问题，第一反应可能是拖着。现在可以先把材料交给AI，让它整理重点、列出缺失信息，再告诉你下一步问谁、做什么。\n\nAI不一定替你生活，但它可以让很多原本很麻烦的事情，变得更容易开始。`,
    ],
    codex: [
      `“${anchor}”不一定只能写成一段话，也可以直接做成一个工具。\n\n把用户是谁、遇到什么问题、输入什么、输出什么告诉Codex，让它先搭一个最小版本。不会写代码也没关系，先看结果能不能跑，再继续修改。\n\nAI编程最有意思的地方，是普通人的很多想法终于有机会被做出来。`,
      `以前有个小工具的想法，第一道门槛是“我不会写代码”。\n\n现在可以把“${anchor}”背后的需求拆成页面、数据和操作流程，交给Codex做出第一版。你负责描述问题、测试结果、指出哪里不对。\n\n从想法到原型，已经不一定要先学几个月技术。`,
    ],
    token: [
      `如果一件AI任务只做一次，聊天窗口就够了。\n\n如果“${anchor}”背后的工作每天要重复几十次，就应该考虑把模型接进流程：自动读取、分类、生成，再把异常留给人检查。\n\nToken的价值不是多聊几句话，而是让一次有效操作可以持续运行。`,
      `“${anchor}。”\n\n当一个流程已经验证有效，下一步不是每天手动复制粘贴，而是通过模型调用把它批量跑起来。先从最稳定、最重复、结果最容易检查的一步开始。\n\nAI从工具变成生产力，往往就发生在这一步。`,
    ],
  };
  const options = templates[resolved] || templates.efficiency;
  const optionIndex = style === "auto" ? Math.floor(variant / styleIds.length) % options.length : variant % options.length;
  return options[optionIndex];
}

function createSourceDraft(source) {
  if (source.draft) return source.draft;
  return `${source.title}\n\n${source.insight}\n\n${source.angle}\n\n${source.action || "别急着收藏更多工具。先找一件你今天真的要完成的事，用AI跑完一次，再根据结果继续调整。"}`;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function buildDemoMetrics() {
  return {
    replies: randomBetween(120, 480),
    reposts: randomBetween(300, 1400),
    likes: randomBetween(4200, 18000),
    views: randomBetween(280000, 4200000),
  };
}
function buildPublishCopy(text) {
  const clean = text.replace(/https?:\/\/\S+/g, "").replace(/[#@][^\s]+/g, "").replace(/\s+/g, " ").trim();
  let sentence = "真正有价值的改变，永远从一次具体行动开始";
  if (/(AI|GPT|ChatGPT|Gemini|Token|人工智能)/i.test(clean)) sentence = "AI真正拉开差距的，不是知道多少工具，而是能不能用它解决一个真实问题";
  else if (/(执行|行动|拖延|验证|去做)/.test(clean)) sentence = "真正拉开差距的，从来不是想得多明白，而是愿不愿意马上去做";
  else if (/(问题|思考|认知|判断|理解)/.test(clean)) sentence = "一个真正的好问题，会让你再也回不到原来的看法里";
  else if (/(创业|赚钱|商业|项目|收入|利润)/.test(clean)) sentence = "很多机会并不复杂，真正稀缺的是看见之后愿意马上验证的人";
  else if (/(写作|内容|口播|自媒体|流量|观众)/.test(clean)) sentence = "好内容不是把道理说得更大，而是让人听完愿意多走一步";
  else {
    const candidate = clean.split(/[。！？；]/).map((item) => item.trim()).find((item) => item.length >= 10 && item.length <= 42);
    if (candidate) sentence = candidate;
  }

  const tags = [];
  const add = (tag) => { if (!tags.includes(tag) && tags.length < 2) tags.push(tag); };
  if (/(AI|GPT|ChatGPT|Gemini|Token|人工智能)/i.test(clean)) add("#AI");
  if (/(创业|赚钱|商业|项目|收入|利润)/.test(clean)) { add("#创业"); add("#财富"); }
  if (/(写作|内容|口播|自媒体|流量)/.test(clean)) add("#自媒体");
  if (/(认知|思考|问题|判断)/.test(clean)) add("#认知");
  if (/(自由职业|副业)/.test(clean)) add("#自由职业");
  if (/(成长|学习|执行|行动|拖延)/.test(clean)) add("#个人成长");
  if (tags.length === 0) add("#认知");
  if (tags.length === 1) add("#个人成长");
  return `${sentence} ${tags.join(" ")} #天策`;
}

function TweetCard({ cardRef, mode, selected, text, fontSize, metrics, cardTheme, orientation = "portrait", poster = false }) {
  const isHistory = mode === "history";
  return <article className={`tweet-card theme-${cardTheme} card-${orientation} ${poster ? "poster-tweet-card" : ""}`} ref={cardRef} aria-label="推文图片预览">
    <header className="tweet-header">
      <img className="tweet-avatar" src={avatar} alt="天策头像" />
      <div className="tweet-identity"><div className="tweet-name-line"><strong>天策</strong><SealCheck weight="fill" className="verified-icon" /><span>@Leobai825</span>{isHistory && <><span>·</span><span>{formatDate(selected.date)}</span></>}</div></div>
      <div className="tweet-actions-top" aria-hidden="true"><DotsThree size={25} weight="bold" /></div>
    </header>
    <div className="tweet-body" style={{ fontSize: `${fontSize}px` }}>{text}</div>
    <footer className="tweet-metrics">
      <span><ChatCircle /><em>{formatMetric(metrics.replies)}</em></span>
      <span><Repeat /><em>{formatMetric(metrics.reposts)}</em></span>
      <span className="liked"><Heart weight="fill" /><em>{formatMetric(metrics.likes)}</em></span>
      <span><ChartBar /><em>{formatMetric(metrics.views)}</em></span>
    </footer>
  </article>;
}

export function App() {
  const [mode, setMode] = useState("sources");
  const [outputMode, setOutputMode] = useState("poster");
  const [orientation, setOrientation] = useState("portrait");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialTweet?.id);
  const [draft, setDraft] = useState(() => createDraft(initialTweet));
  const [draftStyle, setDraftStyle] = useState("auto");
  const [draftVariant, setDraftVariant] = useState(0);
  const [sourceQuery, setSourceQuery] = useState("");
  const [sourceCategory, setSourceCategory] = useState("全部");
  const [selectedSourceId, setSelectedSourceId] = useState(contentSources[0].id);
  const [sourceDraft, setSourceDraft] = useState(() => createSourceDraft(contentSources[0]));
  const [fontSize, setFontSize] = useState(18);
  const [cardTheme, setCardTheme] = useState("light");
  const [background, setBackground] = useState(backgrounds[0].src);
  const [backgroundQuery, setBackgroundQuery] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [overlay, setOverlay] = useState(18);
  const [cardScale, setCardScale] = useState(0.9);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [publishCopy, setPublishCopy] = useState("");
  const [metricsTick, setMetricsTick] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");
  const exportRef = useRef(null);
  const directCardRef = useRef(null);
  const dragStateRef = useRef(null);
  const pinchRef = useRef(null);
  const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const selected = useMemo(() => tweets.find((tweet) => tweet.id === selectedId) || tweets[0], [selectedId]);
  const selectedSource = useMemo(() => contentSources.find((source) => source.id === selectedSourceId) || contentSources[0], [selectedSourceId]);
  const metrics = useMemo(() => buildDemoMetrics(), [selectedId, metricsTick]);
  const activeText = mode === "history" ? selected.text : mode === "sources" ? sourceDraft : draft;
  const adaptiveCardFontSize = getAdaptiveFontSize(activeText, fontSize, false);
  const adaptivePosterFontSize = getAdaptiveFontSize(activeText, fontSize, true);
  const posterFitScale = activeText.length > 900 ? 0.62 : activeText.length > 700 ? 0.7 : activeText.length > 520 ? 0.78 : activeText.length > 360 ? 0.86 : 1;
  const sourceCategories = ["全部", ...new Set(contentSources.map((source) => source.category))];
  const sourceResults = useMemo(() => {
    const needle = sourceQuery.trim().toLowerCase();
    return contentSources.filter((source) => (sourceCategory === "全部" || source.category === sourceCategory) && (!needle || `${source.title} ${source.insight} ${source.angle} ${source.productFit.join(" ")}`.toLowerCase().includes(needle)));
  }, [sourceCategory, sourceQuery]);
  const visibleSourceResults = sourceResults.slice(0, 100);
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tweets.slice(0, 12);
    return tweets.filter((tweet) => `${tweet.text} ${tweet.date}`.toLowerCase().includes(needle)).slice(0, 20);
  }, [query]);
  const backgroundResults = useMemo(() => {
    const needle = backgroundQuery.trim().toLowerCase();
    return backgrounds.filter((item) => !needle || `${item.name} ${item.tags}`.toLowerCase().includes(needle));
  }, [backgroundQuery]);
  useEffect(() => setExported(false), [mode, outputMode, orientation, selectedId, draft, fontSize, cardTheme, background, overlay, cardScale, cardPosition, metricsTick]);
  useEffect(() => setCardPosition({ x: 0, y: 0 }), [orientation]);
  useEffect(() => { setPublishCopy(""); setCopyStatus(""); }, [mode, selectedId, draft]);

  function rewriteDraft(tweet = selected, style = draftStyle, nextVariant = draftVariant) { setDraftVariant(nextVariant); setDraft(createDraft(tweet, style, nextVariant)); }
  function selectTweet(tweet) { setSelectedId(tweet.id); if (mode === "draft") rewriteDraft(tweet); }
  function switchMode(nextMode) { setMode(nextMode); if (nextMode === "draft") rewriteDraft(selected); }
  function chooseDraftStyle(style) { setDraftStyle(style); rewriteDraft(selected, style, draftVariant + 1); }
  function selectSource(source) { setSelectedSourceId(source.id); setSourceDraft(createSourceDraft(source)); }
  function pickRandomSource() {
    const pool = sourceResults.length ? sourceResults : contentSources;
    const alternatives = pool.filter((source) => source.id !== selectedSourceId);
    selectSource((alternatives.length ? alternatives : pool)[Math.floor(Math.random() * (alternatives.length ? alternatives.length : pool.length))]);
  }
  function pickRandom() { const pool = tweets.slice(0, Math.min(100, tweets.length)); selectTweet(pool[Math.floor(Math.random() * pool.length)]); }
  function loadUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBackground(String(reader.result));
    reader.readAsDataURL(file);
  }
  function applyBackgroundUrl() {
    const value = backgroundUrl.trim();
    if (!value) return;
    try {
      const parsed = new URL(value);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("unsupported protocol");
      setBackground(`/api/image-proxy?url=${encodeURIComponent(parsed.href)}`);
    } catch {
      window.alert("请粘贴以 http:// 或 https:// 开头的图片地址。");
    }
  }
  function generatePublishCopy() { const next = buildPublishCopy(activeText); setPublishCopy(next); setCopyStatus(""); return next; }
  async function copyDescription() {
    const value = publishCopy || generatePublishCopy();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement("textarea"); input.value = value; document.body.appendChild(input); input.select(); document.execCommand("copy"); input.remove();
    }
    setCopyStatus("已复制，可直接粘贴到抖音");
    window.setTimeout(() => setCopyStatus(""), 2200);
  }
  function resetCardPlacement() { setCardScale(0.9); setCardPosition({ x: 0, y: 0 }); }
  function startDragging(event) {
    if (outputMode !== "poster") return;
    if (pinchRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, origin: cardPosition };
  }
  function dragCard(event) {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !exportRef.current) return;
    const rect = exportRef.current.getBoundingClientRect();
    const canvasWidth = orientation === "landscape" ? 960 : 720;
    const canvasHeight = orientation === "landscape" ? 720 : 960;
    const nextX = drag.origin.x + (event.clientX - drag.startX) * (canvasWidth / rect.width);
    const nextY = drag.origin.y + (event.clientY - drag.startY) * (canvasHeight / rect.height);
    const maxX = orientation === "landscape" ? 380 : 260;
    const maxY = orientation === "landscape" ? 260 : 360;
    setCardPosition({ x: Math.max(-maxX, Math.min(maxX, nextX)), y: Math.max(-maxY, Math.min(maxY, nextY)) });
  }
  function stopDragging(event) {
    if (dragStateRef.current?.pointerId === event.pointerId) dragStateRef.current = null;
  }
  function handleTouchStart(e) {
    if (outputMode !== "poster" || e.touches.length !== 2) return;
    dragStateRef.current = null;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    pinchRef.current = { dist: Math.hypot(dx, dy), scale: cardScale };
  }
  function handleTouchMove(e) {
    if (!pinchRef.current || e.touches.length !== 2) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const ratio = Math.hypot(dx, dy) / pinchRef.current.dist;
    setCardScale(Math.max(0.55, Math.min(1.2, pinchRef.current.scale * ratio)));
  }
  function handleTouchEnd() { pinchRef.current = null; }
  async function deliverImage(dataUrl, filename) {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: "image/png" });
      if (isMobile && navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ files: [file], title: filename });
      } else if (isMobile) {
        const imageUrl = URL.createObjectURL(blob);
        const previewLink = document.createElement("a");
        previewLink.href = imageUrl;
        previewLink.target = "_blank";
        previewLink.rel = "noopener noreferrer";
        document.body.appendChild(previewLink);
        previewLink.click();
        previewLink.remove();
        window.setTimeout(() => URL.revokeObjectURL(imageUrl), 60000);
        window.alert("图片已打开，请长按图片，选择“存储图像”或“保存到相册”。");
      } else {
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.click();
      }
  }
  async function exportNode(node, filename, backgroundColor) {
    if (!node || exporting) return;
    setExporting(true);
    try {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2, backgroundColor });
      await deliverImage(dataUrl, filename);
      setExported(true);
      window.setTimeout(() => setExported(false), 1800);
    } catch (error) {
      if (error?.name === "AbortError") return;
      window.alert("这张网络图片禁止跨站导出。请先保存图片，再用“上传自己的背景”导入。");
    } finally { setExporting(false); }
  }
  async function downloadImage() {
    const fileLabel = mode === "history" ? selected.date : new Date().toISOString().slice(0, 10);
    const direction = orientation === "landscape" ? "横版" : "竖版";
    const filename = outputMode === "poster" ? `抖音图文-${direction}-${fileLabel}.png` : `推文卡片-${direction}-${fileLabel}.png`;
    return exportNode(exportRef.current, filename, outputMode === "poster" ? "#161616" : cardTheme === "light" ? "#ffffff" : "#000000");
  }
  async function exportDirectCard() {
    const fileLabel = mode === "history" ? selected.date : new Date().toISOString().slice(0, 10);
    const direction = orientation === "landscape" ? "横版" : "竖版";
    return exportNode(directCardRef.current, `纯推文卡片-${direction}-${fileLabel}.png`, cardTheme === "light" ? "#ffffff" : "#000000");
  }

  const hasEditor = mode === "draft" || mode === "sources";
  const outputStep = hasEditor ? "04" : "03";
  const backgroundStep = hasEditor ? "05" : "04";
  const finishStep = hasEditor ? (outputMode === "poster" ? "06" : "05") : (outputMode === "poster" ? "05" : "04");

  return <main className="app-shell">
    <header className="topbar"><div className="brand-mark">TC</div><div><p className="eyebrow">TIANCE MATRIX</p><h1>抖音图文生成器</h1></div><div className="privacy-badge"><ShieldCheck weight="fill" /> 选内容 · 选背景 · 直接发</div></header>
    <div className="app-grid">
      <aside className="control-panel">
        <section className="panel-section mode-section"><div className="section-heading"><span className="step-number">01</span><div><h2>选择内容来源</h2><p>从可信素材、历史原推或自由编辑开始</p></div></div><div className="segmented-control three"><button className={mode === "sources" ? "active" : ""} onClick={() => switchMode("sources")}>AI素材库</button><button className={mode === "history" ? "active" : ""} onClick={() => switchMode("history")}>历史原推</button><button className={mode === "draft" ? "active" : ""} onClick={() => switchMode("draft")}>自由编辑</button></div></section>
        {mode === "sources" && <section className="panel-section source-library-section">
          <div className="section-heading compact"><span className="step-number">02</span><div><h2>{contentSources.length.toLocaleString("zh-CN")} 条中文成品素材</h2><p>当前筛选 {sourceResults.length} 条，选一个就能生成</p></div></div>
          <div className="search-row"><label className="search-box"><MagnifyingGlass /><input value={sourceQuery} onChange={(event) => setSourceQuery(event.target.value)} placeholder="搜：效率、赚钱、Codex、Token" /></label><button className="icon-button" onClick={pickRandomSource} title="从当前结果随机一条" aria-label="随机一条素材"><Shuffle /></button></div>
          <div className="category-pills">{sourceCategories.map((category) => <button key={category} className={sourceCategory === category ? "active" : ""} onClick={() => setSourceCategory(category)}>{category}</button>)}</div>
          <div className="source-list">{visibleSourceResults.map((source) => <article key={source.id} className={`source-item ${source.id === selectedSource.id ? "selected" : ""}`}><button className="source-main" onClick={() => selectSource(source)}><span className="source-meta"><b>{source.category}</b><em>{source.productFit.join(" · ")}</em></span><strong>{source.title}</strong><p>{source.insight}</p></button><a href={source.sourceUrl} target="_blank" rel="noreferrer"><LinkSimple /> {source.sourceName}</a></article>)}</div>
          <p className="source-note"><ShieldCheck weight="fill" /> 为保证页面流畅，每次展示前 100 条，搜索和分类会检索完整素材库。数据、个人经历和收入在发布前必须复核，不得虚构。</p>
        </section>}
        {mode !== "sources" && <section className="panel-section archive-section">
          <div className="section-heading compact"><span className="step-number">02</span><div><h2>搜索 {tweets.length} 条推文</h2><p>搜关键词，点一条就能直接用</p></div></div>
          <div className="search-row"><label className="search-box"><MagnifyingGlass /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：创业、AI、自媒体" /></label><button className="icon-button" onClick={pickRandom}><Shuffle /></button></div>
          <div className="tweet-list" role="listbox">{results.map((tweet) => <button key={tweet.id} className={`tweet-list-item ${tweet.id === selected.id ? "selected" : ""}`} onClick={() => selectTweet(tweet)}><span className="item-date">{tweet.date}</span><strong>{tweet.text.replace(/\s+/g, " ").slice(0, 58)}</strong><span className="item-stats">{tweet.likes.toLocaleString("zh-CN")} 赞 · {tweet.reposts.toLocaleString("zh-CN")} 转</span></button>)}{results.length === 0 && <div className="empty-state">没有找到，换一个关键词。</div>}</div>
        </section>}
        {mode === "sources" && <section className="panel-section editor-section"><div className="section-heading compact"><span className="step-number">03</span><div><h2>调整生成内容</h2><p>保留事实，改成你自己真实说话的方式</p></div></div><textarea value={sourceDraft} onChange={(event) => setSourceDraft(event.target.value)} rows={10} /><div className="editor-actions"><span>{sourceDraft.length} 字</span><button className="secondary-button" onClick={() => setSourceDraft(createSourceDraft(selectedSource))}><Sparkle weight="fill" /> 重新生成</button></div></section>}
        {mode === "draft" && <section className="panel-section editor-section"><div className="section-heading compact"><span className="step-number">03</span><div><h2>选择改写感觉</h2><p>不是换一句话，而是整篇换结构</p></div></div><div className="rewrite-style-pills">{rewriteStyles.map((style) => <button key={style.id} className={draftStyle === style.id ? "active" : ""} onClick={() => chooseDraftStyle(style.id)}>{style.label}</button>)}</div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={10} /><div className="editor-actions"><span>{draft.length} 字</span><button className="secondary-button" onClick={() => rewriteDraft(selected, draftStyle, draftVariant + 1)}><Shuffle weight="fill" /> 换一种写法</button></div><p className="rewrite-note">内容只营造“尽快真正用上AI”的认知，不写收益承诺、诱导购买或无法核实的个人经历。</p></section>}
        <section className="panel-section output-section"><div className="section-heading compact"><span className="step-number">{outputStep}</span><div><h2>选择发布样式</h2><p>先选成品类型，再选横版或竖版</p></div></div><div className="output-picker"><button className={outputMode === "poster" ? "active" : ""} onClick={() => setOutputMode("poster")}><ImageSquare weight="fill" /><strong>背景图成品</strong><span>卡片叠加背景</span></button><button className={outputMode === "card" ? "active" : ""} onClick={() => setOutputMode("card")}><BookmarkSimple weight="fill" /><strong>纯推文卡片</strong><span>没有额外背景</span></button></div><div className="orientation-control"><span>图片方向</span><div className="orientation-picker" role="group" aria-label="选择图片方向"><button type="button" className={orientation === "portrait" ? "active" : ""} onClick={() => setOrientation("portrait")}><i className="orientation-icon portrait" />竖版</button><button type="button" className={orientation === "landscape" ? "active" : ""} onClick={() => setOrientation("landscape")}><i className="orientation-icon landscape" />横版</button></div><small>{outputMode === "poster" ? (orientation === "portrait" ? "3:4，适合抖音图文" : "4:3，适合横版内容") : "卡片宽度和文字大小会按方向自动适配"}</small></div></section>
        {outputMode === "poster" && <section className="panel-section background-section">
          <div className="section-heading compact"><span className="step-number">{backgroundStep}</span><div><h2>选择背景</h2><p>内置图库、本地上传、网络图片都能用</p></div></div>
          <label className="search-box background-search"><MagnifyingGlass /><input value={backgroundQuery} onChange={(event) => setBackgroundQuery(event.target.value)} placeholder="搜：香港、城市、夜景、山海" /></label>
          <div className="background-grid">{backgroundResults.map((item) => <button key={item.id} className={background === item.src ? "active" : ""} onClick={() => setBackground(item.src)}><img src={item.src} alt={item.name} /><span>{item.name}</span></button>)}</div>
          <div className="background-actions"><label className="upload-button"><UploadSimple /> 上传自己的背景<input type="file" accept="image/*" onChange={loadUpload} /></label><div className="url-row"><input value={backgroundUrl} onChange={(event) => setBackgroundUrl(event.target.value)} placeholder="或粘贴网上的图片地址" /><button onClick={applyBackgroundUrl}>使用</button></div></div>
          <label className="range-label"><span>背景压暗 <b>{overlay}%</b></span><input type="range" min="0" max="55" value={overlay} onChange={(event) => setOverlay(Number(event.target.value))} /></label>
          <div className="placement-controls">
            <label className="range-label"><span>卡片大小 <b>{Math.round(cardScale * 100)}%</b></span><input type="range" min="55" max="120" value={Math.round(cardScale * 100)} onChange={(event) => setCardScale(Number(event.target.value) / 100)} /></label>
            <div className="drag-help"><span>在右侧直接拖动卡片调整位置</span><button onClick={resetCardPlacement}>居中重置</button></div>
          </div>
        </section>}
        <section className="panel-section visual-section"><div className="section-heading compact"><span className="step-number">{finishStep}</span><div><h2>检查并下载</h2><p>右侧看到的就是最终图片</p></div></div><div className="card-theme-control"><span>卡片背景</span><div className="card-theme-picker" role="group" aria-label="选择卡片背景"><button type="button" className={cardTheme === "light" ? "active" : ""} onClick={() => setCardTheme("light")}><i className="theme-swatch light" />白色</button><button type="button" className={cardTheme === "dark" ? "active" : ""} onClick={() => setCardTheme("dark")}><i className="theme-swatch dark" />黑色</button></div></div><label className="range-label"><span>正文字号 <b>{fontSize}px</b>{adaptiveCardFontSize < fontSize && <em>长文自动适配为 {adaptiveCardFontSize}px</em>}</span><input type="range" min="13" max="22" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} /></label><button className="direct-export-button" onClick={exportDirectCard} disabled={exporting}><BookmarkSimple weight="fill" /><span><strong>{isMobile ? "保存纯推文卡片到相册" : "直接导出纯推文卡片"}</strong><small>没有海报背景，尺寸随正文自动增高</small></span></button>{outputMode === "poster" && activeText.length > 700 && <div className="length-warning"><WarningCircle weight="fill" /><span>这条内容很长，系统已经自动缩小卡片。纯卡片导出不会截断，抖音竖图建议适当精简。</span></div>}</section>
        <section className="panel-section publish-copy-section">
          <div className="section-heading compact"><span className="step-number">{String(Number(finishStep) + 1).padStart(2, "0")}</span><div><h2>准备发布文案和话题</h2><p>自动生成一句文案 + 3 个相关标签</p></div></div>
          {publishCopy ? <div className="publish-copy-result">{publishCopy}</div> : <div className="publish-copy-empty">点击下方按钮，根据当前推文自动生成。</div>}
          <div className="publish-copy-actions"><button className="secondary-button" onClick={generatePublishCopy}><Sparkle weight="fill" /> {publishCopy ? "重新生成" : "生成发布文案"}</button><button className="copy-button" onClick={copyDescription}><CopySimple weight="bold" /> 一键复制</button></div>
          <p className="copy-check-note">{copyStatus || "复制前快速检查一遍，确认没有偏离原推意思。"}</p>
        </section>
      </aside>
      <section className="preview-panel">
        <div className="preview-toolbar"><div><span className={`status-dot ${mode}`} /><strong>{outputMode === "poster" ? `${orientation === "portrait" ? "竖版 3:4" : "横版 4:3"}成品预览` : `${orientation === "portrait" ? "竖版" : "横版"}纯推文卡片预览`}</strong></div><div className="toolbar-actions">{mode === "history" && <a href={selected.url} target="_blank" rel="noreferrer"><LinkSimple /> 查看原推</a>}{mode === "sources" && <a href={selectedSource.sourceUrl} target="_blank" rel="noreferrer"><LinkSimple /> 查看来源</a>}<button type="button" className="ghost-button" onClick={() => setMetricsTick((t) => t + 1)}><ArrowsClockwise /> 换一组数据</button></div></div>
        <div className={`preview-stage ${outputMode} ${orientation}`}>{outputMode === "poster" ? <div className={`douyin-poster ${orientation}`} ref={exportRef}><img className="poster-background" src={background} crossOrigin="anonymous" alt="" /><div className="poster-overlay" style={{ background: `rgba(0,0,0,${overlay / 100})` }} /><div className="poster-card-wrap" style={{ left: `calc(50% + ${cardPosition.x}px)`, top: `calc(50% + ${cardPosition.y}px)`, transform: `translate(-50%, -50%) scale(${cardScale * posterFitScale})` }} onPointerDown={startDragging} onPointerMove={dragCard} onPointerUp={stopDragging} onPointerCancel={stopDragging} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}><TweetCard mode={mode} selected={selected} text={activeText} fontSize={adaptivePosterFontSize} metrics={metrics} cardTheme={cardTheme} orientation={orientation} poster /></div><div className="poster-tip">TIANCE MATRIX · 认知 / 创业 / AI</div></div> : <TweetCard cardRef={exportRef} mode={mode} selected={selected} text={activeText} fontSize={adaptiveCardFontSize} metrics={metrics} cardTheme={cardTheme} orientation={orientation} />}</div>
        <div className="export-bar"><div className="export-note"><Check weight="bold" /><span>{isMobile ? "生成后在系统面板选择“存储图像”，即可保存到相册。" : outputMode === "poster" ? "下载图片，再复制发布文案，就能直接发抖音。" : "下载纯推文卡片 PNG。"}</span></div><div className="export-actions"><button className="copy-export-button" onClick={copyDescription}><CopySimple weight="bold" /> 复制发布文案</button><button className="download-button" onClick={downloadImage} disabled={exporting}>{exported ? <Check weight="bold" /> : <DownloadSimple weight="bold" />}{exporting ? "正在生成…" : exported ? (isMobile ? "已生成" : "已下载") : (isMobile ? "保存到相册" : "一键下载成品")}</button></div></div>
      </section>
    </div>
    <div className="direct-card-export" aria-hidden="true"><TweetCard cardRef={directCardRef} mode={mode} selected={selected} text={activeText} fontSize={adaptiveCardFontSize} metrics={metrics} cardTheme={cardTheme} orientation={orientation} /></div>
  </main>;
}
