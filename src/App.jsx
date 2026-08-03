import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  BookmarkSimple,
  ChartBar,
  ChatCircle,
  Check,
  DownloadSimple,
  DotsThree,
  Heart,
  LinkSimple,
  MagnifyingGlass,
  Repeat,
  SealCheck,
  ShieldCheck,
  Shuffle,
  Sparkle,
} from "@phosphor-icons/react";
import tweets from "./tweets.json";

const avatar = "/assets/tiance-avatar.jpg";
const initialTweet = tweets.find((tweet) => tweet.id === "2000941227961733492") || tweets[0];

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

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildDemoMetrics() {
  return {
    replies: randomBetween(70, 160),
    reposts: randomBetween(90, 520),
    likes: randomBetween(800, 3200),
    views: randomBetween(50000, 1000000),
  };
}

function cleanSentence(value) {
  return value
    .replace(/https?:\/\/\S+/g, "")
    .split(/[。！？\n]/)
    .map((item) => item.trim())
    .find((item) => item.length >= 8 && item.length <= 52);
}

function createDraft(source) {
  const anchor = cleanSentence(source.text) || "真正重要的不是听懂一个道理，而是把它放进现实里检验";
  return `最近重新翻到我以前写过的一句话：\n\n“${anchor}。”\n\n当时更在意把判断说出来。现在回头看，真正有价值的不是一句话听起来多对，而是它能不能变成一个具体动作。\n\n所以我接下来会把这件事拆成一个小实验：先做一个最小版本，发出去，看真实反馈，再决定要不要继续。\n\n看到问题 → 动手验证 → 接受反馈 → 再迭代。\n\n创业很多时候没有标准答案，答案是做出来的。`;
}

function TweetCard({ cardRef, mode, selected, draft, demoMetrics, fontSize }) {
  const isHistory = mode === "history";
  const metrics = {
    replies: demoMetrics.replies,
    reposts: isHistory ? selected.reposts : demoMetrics.reposts,
    likes: isHistory ? selected.likes : demoMetrics.likes,
    views: demoMetrics.views,
  };
  const metricNotice = isHistory ? "评论 / 浏览为模拟数据" : "模拟卡片";

  return (
    <article className="tweet-card" ref={cardRef} aria-label="推文图片预览">
      <div className="demo-watermark">{metricNotice}</div>

      <header className="tweet-header">
        <img className="tweet-avatar" src={avatar} alt="天策头像" />
        <div className="tweet-identity">
          <div className="tweet-name-line">
            <strong>天策</strong>
            <SealCheck weight="fill" className="verified-icon" aria-label="认证标识" />
            <span>@Leobai825</span>
            {isHistory && <><span>·</span><span>{formatDate(selected.date)}</span></>}
          </div>
        </div>
        <div className="tweet-actions-top" aria-hidden="true">
          <DotsThree size={25} weight="bold" />
        </div>
      </header>

      <div className="tweet-body" style={{ fontSize: `${fontSize}px` }}>
        {isHistory ? selected.text : draft}
      </div>

      <footer className="tweet-metrics" aria-label="互动数据">
        <span><ChatCircle /><em>{formatMetric(metrics.replies)}</em></span>
        <span><Repeat /><em>{formatMetric(metrics.reposts)}</em></span>
        <span className="liked"><Heart weight="fill" /><em>{formatMetric(metrics.likes)}</em></span>
        <span><ChartBar /><em>{formatMetric(metrics.views)}</em></span>
        <span className="metric-spacer" />
        <BookmarkSimple />
      </footer>
    </article>
  );
}

export function App() {
  const [mode, setMode] = useState("history");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialTweet?.id);
  const [draft, setDraft] = useState(() => createDraft(initialTweet));
  const [demoMetrics, setDemoMetrics] = useState(buildDemoMetrics);
  const [fontSize, setFontSize] = useState(18);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const cardRef = useRef(null);

  const selected = useMemo(
    () => tweets.find((tweet) => tweet.id === selectedId) || tweets[0],
    [selectedId],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tweets.slice(0, 12);
    return tweets
      .filter((tweet) => `${tweet.text} ${tweet.date}`.toLowerCase().includes(needle))
      .slice(0, 20);
  }, [query]);

  useEffect(() => {
    setExported(false);
  }, [mode, selectedId, draft, demoMetrics, fontSize]);

  function selectTweet(tweet) {
    setSelectedId(tweet.id);
    if (mode === "draft") setDraft(createDraft(tweet));
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    if (nextMode === "draft") {
      setDraft(createDraft(selected));
    }
  }

  function pickRandom() {
    const pool = tweets.slice(0, Math.min(100, tweets.length));
    selectTweet(pool[Math.floor(Math.random() * pool.length)]);
  }

  function regenerate() {
    const alternative = createDraft(selected)
      .replace("最近重新翻到", "今天又看到")
      .replace("所以我接下来会", "接下来，我准备");
    setDraft(alternative);
  }

  async function downloadCard() {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      setDemoMetrics(buildDemoMetrics());
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#000000",
      });
      const link = document.createElement("a");
      const filename = mode === "history" ? `天策原推-${selected.date}` : "天策-模拟卡片";
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
      setExported(true);
      window.setTimeout(() => setExported(false), 1800);
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">TC</div>
        <div>
          <p className="eyebrow">TIANCE MATRIX</p>
          <h1>推文卡片生成器</h1>
        </div>
        <div className="privacy-badge"><ShieldCheck weight="fill" /> 仅使用公开归档</div>
      </header>

      <div className="app-grid">
        <aside className="control-panel">
          <section className="panel-section mode-section">
            <div className="section-heading">
              <span className="step-number">01</span>
              <div><h2>选择内容方式</h2><p>原推保真，编辑卡片保留模拟标识</p></div>
            </div>
            <div className="segmented-control">
              <button className={mode === "history" ? "active" : ""} onClick={() => switchMode("history")}>历史原推</button>
              <button className={mode === "draft" ? "active" : ""} onClick={() => switchMode("draft")}>编辑文案</button>
            </div>
          </section>

          <section className="panel-section archive-section">
            <div className="section-heading compact">
              <span className="step-number">02</span>
              <div><h2>从 {tweets.length} 条原推里找</h2><p>{mode === "draft" ? "选择一条作为文案主题参考" : "按正文或日期搜索"}</p></div>
            </div>
            <div className="search-row">
              <label className="search-box">
                <MagnifyingGlass />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：创业、自媒体、AI" />
              </label>
              <button className="icon-button" onClick={pickRandom} title="随机一条高互动原推"><Shuffle /></button>
            </div>
            <div className="tweet-list" role="listbox" aria-label="公开原推列表">
              {results.map((tweet) => (
                <button
                  key={tweet.id}
                  className={`tweet-list-item ${tweet.id === selected.id ? "selected" : ""}`}
                  onClick={() => selectTweet(tweet)}
                  role="option"
                  aria-selected={tweet.id === selected.id}
                >
                  <span className="item-date">{tweet.date}</span>
                  <strong>{tweet.text.replace(/\s+/g, " ").slice(0, 58)}</strong>
                  <span className="item-stats">{tweet.likes.toLocaleString("zh-CN")} 赞 · {tweet.reposts.toLocaleString("zh-CN")} 转</span>
                </button>
              ))}
              {results.length === 0 && <div className="empty-state">没有找到，换一个关键词试试。</div>}
            </div>
          </section>

          {mode === "draft" && (
            <section className="panel-section editor-section">
              <div className="section-heading compact">
                <span className="step-number">03</span>
                <div><h2>编辑天策文案</h2><p>头像、名字和用户名固定，只修改正文</p></div>
              </div>
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={10} />
              <div className="editor-actions">
                <span>{draft.length} 字</span>
                <button className="secondary-button" onClick={regenerate}><Sparkle weight="fill" /> 换一种写法</button>
              </div>
            </section>
          )}

          <section className="panel-section visual-section">
            <div className="section-heading compact">
              <span className="step-number">{mode === "draft" ? "04" : "03"}</span>
              <div><h2>调整图片</h2><p>预览与下载内容完全一致</p></div>
            </div>
            <label className="range-label">
              <span>正文字号 <b>{fontSize}px</b></span>
              <input type="range" min="15" max="22" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} />
            </label>
            <div className="auto-metrics-card">
              <div><strong>下载时自动换一组数据</strong><span>评论 70–160 · 浏览 5–100 万</span></div>
              <button onClick={() => setDemoMetrics(buildDemoMetrics())}><Shuffle /> 现在换一组</button>
            </div>
          </section>
        </aside>

        <section className="preview-panel">
          <div className="preview-toolbar">
            <div>
              <span className={`status-dot ${mode}`} />
              <strong>{mode === "history" ? "真实归档预览" : "编辑文案预览"}</strong>
            </div>
            {mode === "history" && <a href={selected.url} target="_blank" rel="noreferrer"><LinkSimple /> 查看原推</a>}
          </div>

          <div className="preview-stage">
            <TweetCard
              cardRef={cardRef}
              mode={mode}
              selected={selected}
              draft={draft}
              demoMetrics={demoMetrics}
              fontSize={fontSize}
            />
          </div>

          <div className="export-bar">
            <div className="export-note">
              <Check weight="bold" />
              <span>{mode === "history" ? "日期、点赞与转发来自公开归档；评论与浏览为模拟展示。" : "头像、名字和用户名固定为天策；正文可编辑，卡片保留模拟标识。"}</span>
            </div>
            <button className="download-button" onClick={downloadCard} disabled={exporting}>
              {exported ? <Check weight="bold" /> : <DownloadSimple weight="bold" />}
              {exporting ? "正在生成…" : exported ? "已下载" : "下载 PNG"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
