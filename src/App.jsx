import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  BookmarkSimple, ChartBar, ChatCircle, Check, DownloadSimple, DotsThree, Heart,
  ImageSquare, LinkSimple, MagnifyingGlass, Repeat, SealCheck, ShieldCheck,
  Shuffle, Sparkle, UploadSimple, WarningCircle,
} from "@phosphor-icons/react";
import tweets from "./tweets.json";

const avatar = "/assets/tiance-avatar.jpg";
const initialTweet = tweets.find((tweet) => tweet.id === "2000941227961733492") || tweets[0];
const backgrounds = [
  { id: "city-1", name: "香港海边", tags: "香港 城市 海边 蓝天", src: "/backgrounds/city-1.jpg" },
  { id: "city-2", name: "城市天际线", tags: "香港 城市 天际线 日落", src: "/backgrounds/city-2.jpg" },
  { id: "city-3", name: "街头夜景", tags: "城市 街头 夜景 情绪", src: "/backgrounds/city-3.jpg" },
  { id: "city-4", name: "山海风景", tags: "自然 山 海 风景", src: "/backgrounds/city-4.jpg" },
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
function randomBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function buildDemoMetrics() {
  return { replies: randomBetween(70, 160), reposts: randomBetween(90, 520), likes: randomBetween(800, 3200), views: randomBetween(50000, 1000000) };
}
function cleanSentence(value) {
  return value.replace(/https?:\/\/\S+/g, "").split(/[。！？\n]/).map((item) => item.trim()).find((item) => item.length >= 8 && item.length <= 52);
}
function createDraft(source) {
  const anchor = cleanSentence(source.text) || "真正重要的不是听懂一个道理，而是把它放进现实里检验";
  return `最近重新翻到我以前写过的一句话：\n\n“${anchor}。”\n\n当时更在意把判断说出来。现在回头看，真正有价值的不是一句话听起来多对，而是它能不能变成一个具体动作。\n\n所以我接下来会把这件事拆成一个小实验：先做一个最小版本，发出去，看真实反馈，再决定要不要继续。\n\n看到问题 → 动手验证 → 接受反馈 → 再迭代。`;
}

function TweetCard({ cardRef, mode, selected, draft, demoMetrics, fontSize, poster = false }) {
  const isHistory = mode === "history";
  const metrics = { replies: demoMetrics.replies, reposts: isHistory ? selected.reposts : demoMetrics.reposts, likes: isHistory ? selected.likes : demoMetrics.likes, views: demoMetrics.views };
  return <article className={`tweet-card ${poster ? "poster-tweet-card" : ""}`} ref={cardRef} aria-label="推文图片预览">
    <div className="demo-watermark">{isHistory ? "评论 / 浏览为模拟数据" : "编辑文案卡片"}</div>
    <header className="tweet-header">
      <img className="tweet-avatar" src={avatar} alt="天策头像" />
      <div className="tweet-identity"><div className="tweet-name-line"><strong>天策</strong><SealCheck weight="fill" className="verified-icon" /><span>@Leobai825</span>{isHistory && <><span>·</span><span>{formatDate(selected.date)}</span></>}</div></div>
      <div className="tweet-actions-top" aria-hidden="true"><DotsThree size={25} weight="bold" /></div>
    </header>
    <div className="tweet-body" style={{ fontSize: `${fontSize}px` }}>{isHistory ? selected.text : draft}</div>
    <footer className="tweet-metrics"><span><ChatCircle /><em>{formatMetric(metrics.replies)}</em></span><span><Repeat /><em>{formatMetric(metrics.reposts)}</em></span><span className="liked"><Heart weight="fill" /><em>{formatMetric(metrics.likes)}</em></span><span><ChartBar /><em>{formatMetric(metrics.views)}</em></span><span className="metric-spacer" /><BookmarkSimple /></footer>
  </article>;
}

export function App() {
  const [mode, setMode] = useState("history");
  const [outputMode, setOutputMode] = useState("poster");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialTweet?.id);
  const [draft, setDraft] = useState(() => createDraft(initialTweet));
  const [demoMetrics, setDemoMetrics] = useState(buildDemoMetrics);
  const [fontSize, setFontSize] = useState(18);
  const [background, setBackground] = useState(backgrounds[0].src);
  const [backgroundQuery, setBackgroundQuery] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [overlay, setOverlay] = useState(18);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const exportRef = useRef(null);
  const selected = useMemo(() => tweets.find((tweet) => tweet.id === selectedId) || tweets[0], [selectedId]);
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
  useEffect(() => setExported(false), [mode, outputMode, selectedId, draft, demoMetrics, fontSize, background, overlay]);

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
  async function downloadImage() {
    if (!exportRef.current || exporting) return;
    setExporting(true);
    try {
      setDemoMetrics(buildDemoMetrics());
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
        </section>}
        <section className="panel-section visual-section"><div className="section-heading compact"><span className="step-number">{finishStep}</span><div><h2>检查并下载</h2><p>右侧看到的就是最终图片</p></div></div><label className="range-label"><span>正文字号 <b>{fontSize}px</b></span><input type="range" min="15" max="22" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} /></label>{outputMode === "poster" && activeText.length > 520 && <div className="length-warning"><WarningCircle weight="fill" /><span>这条推文偏长，竖图可能放不下。建议换短一点的推文或缩小字号。</span></div>}</section>
      </aside>
      <section className="preview-panel">
        <div className="preview-toolbar"><div><span className={`status-dot ${mode}`} /><strong>{outputMode === "poster" ? "抖音 3:4 成品预览" : "纯推文卡片预览"}</strong></div>{mode === "history" && <a href={selected.url} target="_blank" rel="noreferrer"><LinkSimple /> 查看原推</a>}</div>
        <div className={`preview-stage ${outputMode}`}>{outputMode === "poster" ? <div className="douyin-poster" ref={exportRef}><img className="poster-background" src={background} crossOrigin="anonymous" alt="" /><div className="poster-overlay" style={{ background: `rgba(0,0,0,${overlay / 100})` }} /><div className="poster-card-wrap"><TweetCard mode={mode} selected={selected} draft={draft} demoMetrics={demoMetrics} fontSize={fontSize} poster /></div><div className="poster-tip">TIANCE MATRIX · 认知 / 创业 / AI</div></div> : <TweetCard cardRef={exportRef} mode={mode} selected={selected} draft={draft} demoMetrics={demoMetrics} fontSize={fontSize} />}</div>
        <div className="export-bar"><div className="export-note"><Check weight="bold" /><span>{outputMode === "poster" ? "3:4 竖图已排好，下载 PNG 后可直接上传抖音。" : "下载纯推文卡片 PNG。"}</span></div><button className="download-button" onClick={downloadImage} disabled={exporting}>{exported ? <Check weight="bold" /> : <DownloadSimple weight="bold" />}{exporting ? "正在生成…" : exported ? "已下载" : "一键下载成品"}</button></div>
      </section>
    </div>
  </main>;
}
