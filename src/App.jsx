import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  ArrowsClockwise, BookmarkSimple, ChartBar, Check, ChatCircle, CopySimple,
  DownloadSimple, DotsThree, Heart, ImageSquare, LinkSimple, MagnifyingGlass,
  Repeat, SealCheck, ShieldCheck, Shuffle, Sparkle, UploadSimple, WarningCircle,
} from "@phosphor-icons/react";
import tweets from "./tweets.json";

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
function cleanSentence(value) {
  return value.replace(/https?:\/\/\S+/g, "").split(/[。！？\n]/).map((item) => item.trim()).find((item) => item.length >= 8 && item.length <= 52);
}
function createDraft(source) {
  const anchor = cleanSentence(source.text) || "真正重要的不是听懂一个道理，而是把它放进现实里检验";
  return `最近重新翻到我以前写过的一句话：\n\n“${anchor}。”\n\n当时更在意把判断说出来。现在回头看，真正有价值的不是一句话听起来多对，而是它能不能变成一个具体动作。\n\n所以我接下来会把这件事拆成一个小实验：先做一个最小版本，发出去，看真实反馈，再决定要不要继续。\n\n看到问题 → 动手验证 → 接受反馈 → 再迭代。`;
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

function TweetCard({ cardRef, mode, selected, draft, fontSize, metrics, poster = false }) {
  const isHistory = mode === "history";
  return <article className={`tweet-card ${poster ? "poster-tweet-card" : ""}`} ref={cardRef} aria-label="推文图片预览">
    <header className="tweet-header">
      <img className="tweet-avatar" src={avatar} alt="天策头像" />
      <div className="tweet-identity"><div className="tweet-name-line"><strong>天策</strong><SealCheck weight="fill" className="verified-icon" /><span>@Leobai825</span>{isHistory && <><span>·</span><span>{formatDate(selected.date)}</span></>}</div></div>
      <div className="tweet-actions-top" aria-hidden="true"><DotsThree size={25} weight="bold" /></div>
    </header>
    <div className="tweet-body" style={{ fontSize: `${fontSize}px` }}>{isHistory ? selected.text : draft}</div>
    <footer className="tweet-metrics">
      <span><ChatCircle /><em>{formatMetric(metrics.replies)}</em></span>
      <span><Repeat /><em>{formatMetric(metrics.reposts)}</em></span>
      <span className="liked"><Heart weight="fill" /><em>{formatMetric(metrics.likes)}</em></span>
      <span><ChartBar /><em>{formatMetric(metrics.views)}</em></span>
    </footer>
  </article>;
}

export function App() {
  const [mode, setMode] = useState("history");
  const [outputMode, setOutputMode] = useState("poster");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialTweet?.id);
  const [draft, setDraft] = useState(() => createDraft(initialTweet));
  const [fontSize, setFontSize] = useState(18);
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
  const dragStateRef = useRef(null);
  const pinchRef = useRef(null);
  const selected = useMemo(() => tweets.find((tweet) => tweet.id === selectedId) || tweets[0], [selectedId]);
  const metrics = useMemo(() => buildDemoMetrics(), [selectedId, metricsTick]);
  const activeText = mode === "history" ? selected.text : draft;
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tweets.slice(0, 12);
    return tweets.filter((tweet) => `${tweet.text} ${tweet.date}`.toLowerCase().includes(needle)).slice(0, 20);
  }, [query]);
  const backgroundResults = useMemo(() => {
    const needle = backgroundQuery.trim().toLowerCase();
    return backgrounds.filter((item) => !needle || `${item.name} ${item.tags}`.toLowerCase().includes(needle));
  }, [backgroundQuery]);
  useEffect(() => setExported(false), [mode, outputMode, selectedId, draft, fontSize, background, overlay, cardScale, cardPosition, metricsTick]);
  useEffect(() => { setPublishCopy(""); setCopyStatus(""); }, [mode, selectedId, draft]);

  function selectTweet(tweet) { setSelectedId(tweet.id); if (mode === "draft") setDraft(createDraft(tweet)); }
  function switchMode(nextMode) { setMode(nextMode); if (nextMode === "draft") setDraft(createDraft(selected)); }
  function pickRandom() { const pool = tweets.slice(0, Math.min(100, tweets.length)); selectTweet(pool[Math.floor(Math.random() * pool.length)]); }
  function loadUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBackground(String(reader.result));
    reader.readAsDataURL(file);
  }
  function applyBackgroundUrl() { const value = backgroundUrl.trim(); if (value) setBackground(value); }
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
    const nextX = drag.origin.x + (event.clientX - drag.startX) * (720 / rect.width);
    const nextY = drag.origin.y + (event.clientY - drag.startY) * (960 / rect.height);
    setCardPosition({ x: Math.max(-260, Math.min(260, nextX)), y: Math.max(-360, Math.min(360, nextY)) });
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
  async function downloadImage() {
    if (!exportRef.current || exporting) return;
    setExporting(true);
    try {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const dataUrl = await toPng(exportRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: outputMode === "poster" ? "#161616" : "#000000" });
      const link = document.createElement("a");
      link.download = outputMode === "poster" ? `抖音图文-${selected.date}.png` : `推文卡片-${selected.date}.png`;
      link.href = dataUrl;
      link.click();
      setExported(true);
      window.setTimeout(() => setExported(false), 1800);
    } catch {
      window.alert("这张网络图片禁止跨站导出。请先保存图片，再用“上传自己的背景”导入。");
    } finally { setExporting(false); }
  }

  const outputStep = mode === "draft" ? "04" : "03";
  const backgroundStep = mode === "draft" ? "05" : "04";
  const finishStep = mode === "draft" ? (outputMode === "poster" ? "06" : "05") : (outputMode === "poster" ? "05" : "04");

  return <main className="app-shell">
    <header className="topbar"><div className="brand-mark">TC</div><div><p className="eyebrow">TIANCE MATRIX</p><h1>抖音图文生成器</h1></div><div className="privacy-badge"><ShieldCheck weight="fill" /> 选内容 · 选背景 · 直接发</div></header>
    <div className="app-grid">
      <aside className="control-panel">
        <section className="panel-section mode-section"><div className="section-heading"><span className="step-number">01</span><div><h2>选择推文内容</h2><p>用原推，或者在原推基础上改写</p></div></div><div className="segmented-control"><button className={mode === "history" ? "active" : ""} onClick={() => switchMode("history")}>历史原推</button><button className={mode === "draft" ? "active" : ""} onClick={() => switchMode("draft")}>编辑文案</button></div></section>
        <section className="panel-section archive-section">
          <div className="section-heading compact"><span className="step-number">02</span><div><h2>搜索 {tweets.length} 条推文</h2><p>搜关键词，点一条就能直接用</p></div></div>
          <div className="search-row"><label className="search-box"><MagnifyingGlass /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：创业、AI、自媒体" /></label><button className="icon-button" onClick={pickRandom}><Shuffle /></button></div>
          <div className="tweet-list" role="listbox">{results.map((tweet) => <button key={tweet.id} className={`tweet-list-item ${tweet.id === selected.id ? "selected" : ""}`} onClick={() => selectTweet(tweet)}><span className="item-date">{tweet.date}</span><strong>{tweet.text.replace(/\s+/g, " ").slice(0, 58)}</strong><span className="item-stats">{tweet.likes.toLocaleString("zh-CN")} 赞 · {tweet.reposts.toLocaleString("zh-CN")} 转</span></button>)}{results.length === 0 && <div className="empty-state">没有找到，换一个关键词。</div>}</div>
        </section>
        {mode === "draft" && <section className="panel-section editor-section"><div className="section-heading compact"><span className="step-number">03</span><div><h2>改写正文</h2><p>只改文字，头像和账号信息已固定</p></div></div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={10} /><div className="editor-actions"><span>{draft.length} 字</span><button className="secondary-button" onClick={() => setDraft(createDraft(selected))}><Sparkle weight="fill" /> 重新生成草稿</button></div></section>}
        <section className="panel-section output-section"><div className="section-heading compact"><span className="step-number">{outputStep}</span><div><h2>选择发布样式</h2><p>纯卡片，或抖音 3:4 背景图成品</p></div></div><div className="output-picker"><button className={outputMode === "poster" ? "active" : ""} onClick={() => setOutputMode("poster")}><ImageSquare weight="fill" /><strong>抖音竖图</strong><span>下载后直接上传</span></button><button className={outputMode === "card" ? "active" : ""} onClick={() => setOutputMode("card")}><BookmarkSimple weight="fill" /><strong>纯推文卡片</strong><span>保留原来的排版</span></button></div></section>
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
        <section className="panel-section visual-section"><div className="section-heading compact"><span className="step-number">{finishStep}</span><div><h2>检查并下载</h2><p>右侧看到的就是最终图片</p></div></div><label className="range-label"><span>正文字号 <b>{fontSize}px</b></span><input type="range" min="15" max="22" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} /></label>{outputMode === "poster" && activeText.length > 520 && <div className="length-warning"><WarningCircle weight="fill" /><span>这条推文偏长，竖图可能放不下。建议换短一点的推文或缩小字号。</span></div>}</section>
        <section className="panel-section publish-copy-section">
          <div className="section-heading compact"><span className="step-number">{String(Number(finishStep) + 1).padStart(2, "0")}</span><div><h2>准备发布文案和话题</h2><p>自动生成一句文案 + 3 个相关标签</p></div></div>
          {publishCopy ? <div className="publish-copy-result">{publishCopy}</div> : <div className="publish-copy-empty">点击下方按钮，根据当前推文自动生成。</div>}
          <div className="publish-copy-actions"><button className="secondary-button" onClick={generatePublishCopy}><Sparkle weight="fill" /> {publishCopy ? "重新生成" : "生成发布文案"}</button><button className="copy-button" onClick={copyDescription}><CopySimple weight="bold" /> 一键复制</button></div>
          <p className="copy-check-note">{copyStatus || "复制前快速检查一遍，确认没有偏离原推意思。"}</p>
        </section>
      </aside>
      <section className="preview-panel">
        <div className="preview-toolbar"><div><span className={`status-dot ${mode}`} /><strong>{outputMode === "poster" ? "抖音 3:4 成品预览" : "纯推文卡片预览"}</strong></div><div className="toolbar-actions">{mode === "history" && <a href={selected.url} target="_blank" rel="noreferrer"><LinkSimple /> 查看原推</a>}<button type="button" className="ghost-button" onClick={() => setMetricsTick((t) => t + 1)}><ArrowsClockwise /> 换一组数据</button></div></div>
        <div className={`preview-stage ${outputMode}`}>{outputMode === "poster" ? <div className="douyin-poster" ref={exportRef}><img className="poster-background" src={background} crossOrigin="anonymous" alt="" /><div className="poster-overlay" style={{ background: `rgba(0,0,0,${overlay / 100})` }} /><div className="poster-card-wrap" style={{ left: `calc(50% + ${cardPosition.x}px)`, top: `calc(50% + ${cardPosition.y}px)`, transform: `translate(-50%, -50%) scale(${cardScale})` }} onPointerDown={startDragging} onPointerMove={dragCard} onPointerUp={stopDragging} onPointerCancel={stopDragging} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}><TweetCard mode={mode} selected={selected} draft={draft} fontSize={fontSize} metrics={metrics} poster /></div><div className="poster-tip">TIANCE MATRIX · 认知 / 创业 / AI</div></div> : <TweetCard cardRef={exportRef} mode={mode} selected={selected} draft={draft} fontSize={fontSize} metrics={metrics} />}</div>
        <div className="export-bar"><div className="export-note"><Check weight="bold" /><span>{outputMode === "poster" ? "下载图片，再复制发布文案，就能直接发抖音。" : "下载纯推文卡片 PNG。"}</span></div><div className="export-actions"><button className="copy-export-button" onClick={copyDescription}><CopySimple weight="bold" /> 复制发布文案</button><button className="download-button" onClick={downloadImage} disabled={exporting}>{exported ? <Check weight="bold" /> : <DownloadSimple weight="bold" />}{exporting ? "正在生成…" : exported ? "已下载" : "一键下载成品"}</button></div></div>
      </section>
    </div>
  </main>;
}
