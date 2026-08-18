import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const seed = JSON.parse(await readFile(resolve("src/content-sources.json"), "utf8")).filter((item) => !item.id.startsWith("matrix-ai-"));

const tracks = [
  { category: "AI实操", topic: "把AI从聊天工具变成任务助手", value: "交付真实结果", fit: ["GPT"], sourceName: "OpenAI Academy", sourceUrl: "https://openai.com/academy/" },
  { category: "AI效率", topic: "把重复劳动交给AI", value: "把时间留给判断和决策", fit: ["GPT", "Token"], sourceName: "OpenAI Academy｜ChatGPT for work", sourceUrl: "https://openai.com/academy/" },
  { category: "AI工作", topic: "让AI进入每天的工作流", value: "缩短从想法到成品的距离", fit: ["GPT", "社群"], sourceName: "OpenAI｜AI adoption at work", sourceUrl: "https://openai.com/business/guides-and-resources/chatgpt-usage-and-adoption-patterns-at-work/" },
  { category: "AI生活", topic: "用AI处理生活里的信息和选择", value: "减少琐事带来的注意力消耗", fit: ["GPT"], sourceName: "OpenAI Academy", sourceUrl: "https://openai.com/academy/" },
  { category: "AI商业", topic: "用AI低成本验证需求", value: "先拿反馈再扩大投入", fit: ["社群", "GPT"], sourceName: "Stanford HAI", sourceUrl: "https://hai.stanford.edu/ai-index" },
  { category: "AI赚钱", topic: "用AI提高可交付的价值", value: "收入来自解决问题而不是收藏工具", fit: ["社群", "GPT", "Token"], sourceName: "Anthropic Economic Index", sourceUrl: "https://www.anthropic.com/economic-index" },
  { category: "AI内容", topic: "让AI参与选题、研究和表达", value: "稳定产出但保留真实判断", fit: ["GPT", "社群"], sourceName: "OpenAI Academy for News Organizations", sourceUrl: "https://openai.com/index/openai-academy-for-news-organizations/" },
  { category: "GPT技巧", topic: "把上下文、目标和格式说清楚", value: "让输出更稳定、更接近可用成品", fit: ["GPT"], sourceName: "OpenAI Academy｜Prompting", sourceUrl: "https://openai.com/academy/" },
  { category: "Codex实操", topic: "把完整项目交给Codex协作", value: "从写几行代码升级为完成任务", fit: ["GPT", "社群"], sourceName: "OpenAI｜Codex", sourceUrl: "https://openai.com/codex/" },
  { category: "Claude实操", topic: "用Claude处理长文、研究和复杂分析", value: "让复杂材料先变成清晰结构", fit: ["GPT"], sourceName: "Anthropic｜Claude use cases", sourceUrl: "https://support.anthropic.com/en/articles/7996845-what-are-some-things-i-can-use-claude-for" },
  { category: "Token自动化", topic: "把模型接进批量任务和自动化流程", value: "让一次有效操作可以重复运行", fit: ["Token"], sourceName: "OpenAI Platform", sourceUrl: "https://platform.openai.com/docs/overview" },
  { category: "AI认知", topic: "重新理解人和AI的分工", value: "把人的注意力放在目标、判断和责任上", fit: ["社群", "GPT"], sourceName: "Stanford AI Index", sourceUrl: "https://hai.stanford.edu/ai-index" }
  ,{ category: "AI学习", topic: "让AI成为随时可以追问的学习搭档", value: "围绕真实问题更快补齐知识缺口", fit: ["GPT", "社群"], sourceName: "OpenAI Academy", sourceUrl: "https://openai.com/academy/" }
  ,{ category: "AI研究", topic: "用AI从问题走到带来源的研究结论", value: "更快找到证据、分歧和下一步判断", fit: ["GPT"], sourceName: "OpenAI Academy｜Research", sourceUrl: "https://openai.com/academy/research/" }
  ,{ category: "AI办公", topic: "把文档、表格和会议接进AI工作流", value: "减少办公室里的重复整理", fit: ["GPT", "Token"], sourceName: "OpenAI Academy｜ChatGPT for work", sourceUrl: "https://openai.com/academy/" }
  ,{ category: "AI创业", topic: "用AI把创业想法更快做成最小版本", value: "用真实反馈代替长时间空想", fit: ["社群", "GPT", "Token"], sourceName: "Stanford HAI", sourceUrl: "https://hai.stanford.edu/ai-index" }
  ,{ category: "AI销售", topic: "让AI辅助理解客户和整理沟通信息", value: "把时间留给真实关系和需求判断", fit: ["GPT", "社群"], sourceName: "OpenAI｜AI adoption at work", sourceUrl: "https://openai.com/business/guides-and-resources/chatgpt-usage-and-adoption-patterns-at-work/" }
  ,{ category: "AI智能体", topic: "把多步骤任务交给智能体持续执行", value: "从一次问答走向可以复用的任务系统", fit: ["Token", "GPT"], sourceName: "OpenAI｜Agents", sourceUrl: "https://openai.com/index/how-agents-are-transforming-work/" }
];

const situations = [
  { name: "写一篇内容", scene: "内容写作", old: "对着空白页面反复憋开头", action: "先给背景、受众和核心观点，让AI搭出结构，再补自己的经历", output: "一篇有个人判断的初稿" },
  { name: "做短视频选题", scene: "短视频选题", old: "只凭感觉猜观众想看什么", action: "把评论、搜索词和历史数据交给AI归类，再挑一个最具体的问题", output: "一个可以立刻开拍的选题" },
  { name: "研究新项目", scene: "新项目研究", old: "收藏一堆资料却没有结论", action: "让AI列出需求、竞品、风险和最低成本验证动作", output: "一张能执行的验证清单" },
  { name: "整理会议", scene: "会议整理", old: "会后靠记忆拼凑重点", action: "让AI从记录中提取决定、负责人、截止时间和未解决问题", output: "一份可以追踪的行动纪要" },
  { name: "学习新知识", scene: "新知识学习", old: "从第一章开始被动看完", action: "先让AI解释全貌，再围绕真实任务补缺口并当场练习", output: "一套用得上的知识结构" },
  { name: "回复客户", scene: "客户回复", old: "每次从头组织措辞", action: "提供客户背景、问题、边界和期望语气，让AI先拟回复", output: "一段清楚又有人味的沟通" },
  { name: "分析数据", scene: "数据分析", old: "盯着表格却不知道先看什么", action: "先定义问题和指标，再让AI检查异常、对比变化并解释可能原因", output: "一个可以继续验证的数据判断" },
  { name: "制作方案", scene: "方案制作", old: "先做漂亮页面再补逻辑", action: "让AI先厘清目标、对象、约束、步骤和验收标准", output: "一份逻辑完整的方案骨架" },
  { name: "处理长文档", scene: "长文档处理", old: "从第一页读到最后一页才开始思考", action: "让AI按问题提取证据、矛盾、结论和待确认信息", output: "一份带依据的阅读笔记" },
  { name: "开发小工具", scene: "小工具开发", old: "因为不会写代码一直停在想法阶段", action: "把用户场景、输入输出和验收方式交给Codex，先做最小版本", output: "一个能被真实用户测试的原型" },
  { name: "运营私域", scene: "私域运营", old: "每天临时想发什么、回什么", action: "把常见问题和真实案例整理成素材，让AI辅助分类、改写和复用", output: "一套持续更新的内容流程" },
  { name: "复盘一天", scene: "每日复盘", old: "只记得自己很忙", action: "让AI根据完成事项、卡点和反馈追问原因，再收敛明天的第一步", output: "一个更具体的下一步动作" }
];

const lenses = [
  { lead: "真正会用AI的人，第一步不是找提示词", pivot: "先把问题说清楚，AI才知道应该往哪里用力", close: "工具不缺，缺的是一个可以被检查的目标" },
  { lead: "AI最有价值的地方，不是替你想一句漂亮话", pivot: "它能先承担搜索、整理和初稿，让你把精力放回判断", close: "效率不是做得更快，而是把时间花在更重要的地方" },
  { lead: "很多人用了AI，工作量却没有真正下降", pivot: "原因是每次都从零聊天，没有把有效做法沉淀成流程", close: "做对一次只是技巧，能稳定重复才是能力" },
  { lead: "别急着问AI能不能帮你赚钱", pivot: "先看它能不能帮你更快解决一个有人愿意付钱的问题", close: "AI降低的是验证成本，成交仍然来自真实价值" },
  { lead: "普通人和高手使用AI的差距，往往不在模型", pivot: "高手会给足上下文、边界和验收标准，也会检查结果", close: "AI放大的不只是能力，也会放大模糊和偷懒" },
  { lead: "把AI当搜索框，只用到了它很小的一部分", pivot: "真正的变化发生在AI开始参与一整段工作，而不是回答一个问题", close: "从一次问答走向完整闭环，效率才会出现复利" },
  { lead: "AI时代最稀缺的可能不是答案", pivot: "答案越来越便宜，提出好问题、判断真假和承担结果反而更重要", close: "模型可以生成选项，但最后的选择仍然属于人" }
];

const openings = [
  (track, situation) => `${situation.scene}这件事，AI最适合先接手最费时间的那一段。`,
  (track, situation) => `别一上来就问AI“你能帮我做什么”。拿${situation.scene}来说，问题越具体，结果越能用。`,
  (track, situation) => `很多人用AI做${situation.scene}，聊了半天，最后还是得自己重来。`,
  (track, situation) => `AI能不能帮你省时间，看一次${situation.scene}就知道了。`,
  (track, situation) => `同样是${situation.scene}，有人用AI多了一堆废话，有人直接拿到能改的初稿。`,
  (track, situation) => `如果AI只给了你一段正确但没用的话，多半不是模型差，是任务还没说清楚。`,
  (track, situation) => `答案现在不稀缺。做${situation.scene}时，知道自己到底要什么，反而更重要。`
];

const endings = [
  (track, situation) => `先别换工具。拿今天手头的${situation.scene}试一次，做完再看它到底省没省时间。`,
  (track, situation) => `下一次做${situation.scene}，把背景、目标、限制和格式一次发给AI，看看第一版能不能直接改。`,
  (track, situation) => `觉得AI不好用时，先别急着下结论。把任务再说具体一点，通常马上就不一样。`,
  (track, situation) => `先跑一个最小版本。结果能用就留下流程，不能用就改要求，别在收藏夹里研究。`,
  (track, situation) => `今天只测这一件事：让AI帮你拿到${situation.output}。好不好用，看结果，不看宣传。`,
  (track, situation) => `把这次有效的问法保存下来。下次再做${situation.scene}，就不用重新摸索。`,
  (track, situation) => `模型可以帮你起步，但最后那遍检查别省。事实、语气和决定，还是要自己负责。`
];

const products = {
  GPT: "适合先用GPT完成一次真实任务",
  Token: "适合需要批量调用或接入自动化流程的人",
  社群: "适合需要同伴反馈、案例和持续行动环境的人"
};

const generated = [];
for (const track of tracks) {
  for (const situation of situations) {
    for (let lensIndex = 0; lensIndex < lenses.length; lensIndex += 1) {
      const lens = lenses[lensIndex];
      const index = generated.length + 1;
      const productLine = track.fit.map((item) => products[item]).join("；");
      const opening = openings[lensIndex](track, situation);
      const ending = endings[(lensIndex + situations.indexOf(situation)) % endings.length](track, situation);
      const middle = `${situation.old}，当然累。可以换个顺序：${situation.action}。先拿到${situation.output}，再由人判断哪里该留、哪里该删。`;
      const draft = `${opening}\n\n${middle}\n\n${track.topic}，说到底就是${track.value}。\n\n${ending}`;
      generated.push({
        id: `matrix-ai-${String(index).padStart(4, "0")}`,
        category: track.category,
        title: `${lens.lead}：${track.topic}，从${situation.name}开始`,
        insight: middle,
        angle: `${lens.pivot}。${track.topic}，说到底就是${track.value}。`,
        action: ending,
        draft,
        conversion: productLine,
        sourceName: track.sourceName,
        sourceUrl: track.sourceUrl,
        productFit: track.fit,
        origin: "基于公开AI资料筛选后形成的中文原创选题，不代表个人亲历或收益承诺"
      });
    }
  }
}

const output = [...seed, ...generated];
await writeFile(resolve("src/content-sources.json"), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ seed: seed.length, generated: generated.length, total: output.length }, null, 2));
