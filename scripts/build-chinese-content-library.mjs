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
];

const situations = [
  { name: "写一篇内容", old: "对着空白页面反复憋开头", action: "先给背景、受众和核心观点，让AI搭出结构，再补自己的经历", output: "一篇有个人判断的初稿" },
  { name: "做短视频选题", old: "只凭感觉猜观众想看什么", action: "把评论、搜索词和历史数据交给AI归类，再挑一个最具体的问题", output: "一个可以立刻开拍的选题" },
  { name: "研究新项目", old: "收藏一堆资料却没有结论", action: "让AI列出需求、竞品、风险和最低成本验证动作", output: "一张能执行的验证清单" },
  { name: "整理会议", old: "会后靠记忆拼凑重点", action: "让AI从记录中提取决定、负责人、截止时间和未解决问题", output: "一份可以追踪的行动纪要" },
  { name: "学习新知识", old: "从第一章开始被动看完", action: "先让AI解释全貌，再围绕真实任务补缺口并当场练习", output: "一套用得上的知识结构" },
  { name: "回复客户", old: "每次从头组织措辞", action: "提供客户背景、问题、边界和期望语气，让AI先拟回复", output: "一段清楚又有人味的沟通" },
  { name: "分析数据", old: "盯着表格却不知道先看什么", action: "先定义问题和指标，再让AI检查异常、对比变化并解释可能原因", output: "一个可以继续验证的数据判断" },
  { name: "制作方案", old: "先做漂亮页面再补逻辑", action: "让AI先厘清目标、对象、约束、步骤和验收标准", output: "一份逻辑完整的方案骨架" },
  { name: "处理长文档", old: "从第一页读到最后一页才开始思考", action: "让AI按问题提取证据、矛盾、结论和待确认信息", output: "一份带依据的阅读笔记" },
  { name: "开发小工具", old: "因为不会写代码一直停在想法阶段", action: "把用户场景、输入输出和验收方式交给Codex，先做最小版本", output: "一个能被真实用户测试的原型" },
  { name: "运营私域", old: "每天临时想发什么、回什么", action: "把常见问题和真实案例整理成素材，让AI辅助分类、改写和复用", output: "一套持续更新的内容流程" },
  { name: "复盘一天", old: "只记得自己很忙", action: "让AI根据完成事项、卡点和反馈追问原因，再收敛明天的第一步", output: "一个更具体的下一步动作" }
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

const products = {
  GPT: "适合先用GPT完成一次真实任务",
  Token: "适合需要批量调用或接入自动化流程的人",
  社群: "适合需要同伴反馈、案例和持续行动环境的人"
};

const generated = [];
for (const track of tracks) {
  for (const situation of situations) {
    for (const lens of lenses) {
      const index = generated.length + 1;
      const productLine = track.fit.map((item) => products[item]).join("；");
      generated.push({
        id: `matrix-ai-${String(index).padStart(4, "0")}`,
        category: track.category,
        title: `${lens.lead}：${track.topic}，从${situation.name}开始`,
        insight: `以前很多人${situation.old}。更有效的做法是：${situation.action}，先得到${situation.output}。`,
        angle: `${lens.pivot}。${track.topic}，最终是为了${track.value}。${lens.close}。`,
        action: `今天就选一个正在发生的“${situation.name}”任务，把背景、目标、限制和成品格式一次说清楚，完成后检查并记录哪里需要调整。`,
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
