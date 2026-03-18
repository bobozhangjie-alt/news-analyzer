/**
 * 新闻偏见分析引擎
 * 基于关键词词库和规则引擎进行偏见检测
 */

// 左倾关键词（进步主义、社会公平、政府干预等）
const LEFT_KEYWORDS = [
  '社会公平', '平等权利', '弱势群体', '社会福利', '公共医疗', '免费教育',
  '工人权益', '劳工保护', '环境保护', '气候变化', '可再生能源', '碳排放',
  '移民权利', '多元文化', '包容性', '系统性歧视', '种族平等', '性别平等',
  '财富再分配', '累进税', '最低工资', '社会保障', '公共住房', '反垄断',
  '监管', '政府干预', '公共利益', '集体行动', '工会', '社会主义',
  '进步', '改革', '左翼', '左派', '民主党', '自由派',
  '压迫', '剥削', '不平等', '贫富差距', '阶级矛盾',
];

// 右倾关键词（保守主义、自由市场、个人责任等）
const RIGHT_KEYWORDS = [
  '自由市场', '市场经济', '私有化', '减税', '小政府', '个人责任',
  '传统价值', '家庭价值', '爱国主义', '国家安全', '边境安全', '移民管控',
  '法律秩序', '强硬执法', '军事力量', '国防建设', '民族主义',
  '经济自由', '企业自由', '去监管', '反对福利', '自力更生',
  '保守', '右翼', '右派', '共和党', '保守派', '传统',
  '精英', '成功人士', '竞争', '优胜劣汰', '效率优先',
  '反对移民', '本国优先', '主权', '独立自主',
];

// 情绪化词汇词库
const EMOTIONAL_WORDS = {
  negative: [
    '极端', '激进', '危险', '威胁', '恐怖', '灾难', '崩溃', '失控',
    '腐败', '丑陋', '肮脏', '卑鄙', '无耻', '罪恶', '邪恶', '可耻',
    '愤怒', '愤慨', '震惊', '恐惧', '绝望', '痛苦', '悲剧',
    '攻击', '侵略', '破坏', '摧毁', '毁灭', '打击',
    '谎言', '欺骗', '操纵', '阴谋', '勾结',
    '失败', '惨败', '溃败', '崩溃',
  ],
  positive: [
    '英雄', '伟大', '辉煌', '卓越', '杰出', '优秀', '完美',
    '胜利', '成功', '突破', '创新', '革命性', '历史性',
    '正义', '公正', '光明', '希望', '美好', '繁荣',
    '坚强', '勇敢', '无畏', '奉献', '牺牲',
  ],
  intensifiers: [
    '绝对', '完全', '彻底', '根本', '从来', '永远', '必然', '肯定',
    '所有', '全部', '每一个', '无一例外', '毫无疑问',
    '显然', '明显', '众所周知', '不言而喻',
  ],
};

// 偏见模式规则
const BIAS_PATTERNS = [
  {
    pattern: /据(不愿透露姓名的|匿名|消息人士称)/,
    reason: '使用匿名消息来源，无法核实信息真实性',
    type: 'source',
  },
  {
    pattern: /有人说|据说|传言|坊间流传/,
    reason: '使用模糊来源，降低信息可信度',
    type: 'source',
  },
  {
    pattern: /总是|从不|永远|从来不|所有人都|没有人/,
    reason: '使用绝对化表述，忽视例外情况',
    type: 'absolute',
  },
  {
    pattern: /显然|明显|众所周知|不言而喻|毋庸置疑/,
    reason: '预设读者认同，回避论证过程',
    type: 'assumption',
  },
  {
    pattern: /极端分子|激进分子|暴徒|乌合之众/,
    reason: '使用贬义标签化描述，带有明显情绪倾向',
    type: 'labeling',
  },
  {
    pattern: /爱国者|英雄|斗士|卫士/,
    reason: '使用褒义标签化描述，带有明显情绪倾向',
    type: 'labeling',
  },
  {
    pattern: /只有|唯一|除非/,
    reason: '非此即彼的二元对立思维，忽视中间立场',
    type: 'binary',
  },
  {
    pattern: /当然|自然|理所当然/,
    reason: '将主观判断包装为客观事实',
    type: 'assumption',
  },
];

/**
 * 分析文章立场
 * @param {string} text 文章文本
 * @returns {object} 立场分析结果
 */
export function analyzeStance(text) {
  let leftScore = 0;
  let rightScore = 0;
  const leftMatches = [];
  const rightMatches = [];

  LEFT_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(keyword, 'g');
    const matches = text.match(regex);
    if (matches) {
      leftScore += matches.length;
      leftMatches.push({ keyword, count: matches.length });
    }
  });

  RIGHT_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(keyword, 'g');
    const matches = text.match(regex);
    if (matches) {
      rightScore += matches.length;
      rightMatches.push({ keyword, count: matches.length });
    }
  });

  const total = leftScore + rightScore;
  let stance = 'neutral';
  let stanceLabel = '中立';
  let stanceScore = 0;
  let description = '';

  if (total === 0) {
    stance = 'neutral';
    stanceLabel = '中立';
    stanceScore = 50;
    description = '文章未检测到明显的政治立场倾向词汇，整体较为中立客观。';
  } else {
    const leftRatio = leftScore / total;
    const rightRatio = rightScore / total;

    if (leftRatio > 0.65) {
      stance = 'left';
      stanceLabel = '偏左';
      stanceScore = Math.round(leftRatio * 100);
      description = `文章使用了较多进步主义、社会公平相关词汇（${leftScore}处），整体呈现左倾立场。`;
    } else if (rightRatio > 0.65) {
      stance = 'right';
      stanceLabel = '偏右';
      stanceScore = Math.round(rightRatio * 100);
      description = `文章使用了较多保守主义、自由市场相关词汇（${rightScore}处），整体呈现右倾立场。`;
    } else if (leftRatio > 0.55) {
      stance = 'slight-left';
      stanceLabel = '轻微偏左';
      stanceScore = Math.round(leftRatio * 100);
      description = `文章略微偏向进步主义立场，但整体较为平衡。`;
    } else if (rightRatio > 0.55) {
      stance = 'slight-right';
      stanceLabel = '轻微偏右';
      stanceScore = Math.round(rightRatio * 100);
      description = `文章略微偏向保守主义立场，但整体较为平衡。`;
    } else {
      stance = 'neutral';
      stanceLabel = '中立';
      stanceScore = 50;
      description = '文章左右倾向词汇分布较为均衡，整体立场较为中立。';
    }
  }

  return {
    stance,
    stanceLabel,
    stanceScore,
    description,
    leftScore,
    rightScore,
    leftMatches: leftMatches.slice(0, 5),
    rightMatches: rightMatches.slice(0, 5),
  };
}

/**
 * 检测偏见句子
 * @param {string} text 文章文本
 * @returns {Array} 偏见句子列表
 */
export function detectBiasedSentences(text) {
  // 按句子分割
  const sentences = text
    .split(/[。！？\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const biasedSentences = [];

  sentences.forEach((sentence) => {
    const reasons = [];

    BIAS_PATTERNS.forEach(({ pattern, reason, type }) => {
      if (pattern.test(sentence)) {
        reasons.push({ reason, type });
      }
    });

    // 检查情绪化词汇密度
    let emotionalCount = 0;
    [...EMOTIONAL_WORDS.negative, ...EMOTIONAL_WORDS.positive].forEach((word) => {
      if (sentence.includes(word)) emotionalCount++;
    });

    if (emotionalCount >= 2) {
      reasons.push({
        reason: `句子中包含${emotionalCount}个情绪化词汇，情绪渲染较强`,
        type: 'emotional',
      });
    }

    if (reasons.length > 0) {
      biasedSentences.push({
        sentence,
        reasons,
        severity: reasons.length >= 2 ? 'high' : 'medium',
      });
    }
  });

  return biasedSentences;
}

/**
 * 识别情绪词汇
 * @param {string} text 文章文本
 * @returns {object} 情绪词汇分析结果
 */
export function analyzeEmotionalWords(text) {
  const found = {
    negative: [],
    positive: [],
    intensifiers: [],
  };

  Object.entries(EMOTIONAL_WORDS).forEach(([type, words]) => {
    words.forEach((word) => {
      if (text.includes(word)) {
        const count = (text.match(new RegExp(word, 'g')) || []).length;
        found[type].push({ word, count });
      }
    });
  });

  const totalEmotional =
    found.negative.length + found.positive.length + found.intensifiers.length;

  // 计算情绪化程度（0-100）
  const wordCount = text.replace(/\s/g, '').length;
  const emotionalDensity = Math.min(100, Math.round((totalEmotional / (wordCount / 100)) * 20));

  return {
    negative: found.negative,
    positive: found.positive,
    intensifiers: found.intensifiers,
    totalEmotional,
    emotionalDensity,
    level:
      emotionalDensity > 60
        ? '高度情绪化'
        : emotionalDensity > 30
        ? '中度情绪化'
        : '较为理性',
  };
}

/**
 * 生成多角度阅读建议
 * @param {object} stanceResult 立场分析结果
 * @param {object} emotionResult 情绪分析结果
 * @returns {Array} 建议列表
 */
export function generatePerspectiveSuggestions(stanceResult, emotionResult) {
  const suggestions = [];

  if (stanceResult.stance === 'left' || stanceResult.stance === 'slight-left') {
    suggestions.push({
      title: '寻找保守派视角',
      description: '该文章呈现左倾立场，建议同时阅读保守主义媒体对同一事件的报道',
      examples: ['关注强调个人责任、市场解决方案的报道', '寻找质疑政府干预效果的分析文章', '了解传统价值观支持者的观点'],
      icon: 'balance',
    });
  }

  if (stanceResult.stance === 'right' || stanceResult.stance === 'slight-right') {
    suggestions.push({
      title: '寻找进步派视角',
      description: '该文章呈现右倾立场，建议同时阅读进步主义媒体对同一事件的报道',
      examples: ['关注强调社会公平、集体利益的报道', '寻找分析系统性问题的深度文章', '了解弱势群体受影响的实际情况'],
      icon: 'balance',
    });
  }

  if (emotionResult.emotionalDensity > 40) {
    suggestions.push({
      title: '寻找中性客观报道',
      description: '该文章情绪化程度较高，建议寻找更为客观中性的报道',
      examples: ['优先阅读以数据和事实为主的报道', '关注学术研究机构发布的分析报告', '参考多家媒体的综合报道'],
      icon: 'neutral',
    });
  }

  suggestions.push({
    title: '核实原始信息来源',
    description: '建议追溯文章引用的原始数据和信息来源',
    examples: ['查找文章引用的官方数据原文', '核实专家身份和引用的准确性', '搜索相关事件的第一手报道'],
    icon: 'verify',
  });

  suggestions.push({
    title: '了解国际视角',
    description: '参考国际媒体对同一事件的报道，获取更广泛的视角',
    examples: ['阅读来自不同国家媒体的报道', '关注国际组织的官方声明', '了解事件对不同地区的影响'],
    icon: 'global',
  });

  if (stanceResult.stance === 'neutral') {
    suggestions.push({
      title: '深入了解各方立场',
      description: '文章较为中立，可进一步了解各方的深层立场和诉求',
      examples: ['阅读各方的原始声明和立场文件', '关注利益相关方的直接表态', '了解历史背景和深层原因'],
      icon: 'explore',
    });
  }

  return suggestions;
}

/**
 * 综合分析文章
 * @param {string} text 文章文本
 * @returns {object} 完整分析结果
 */
export function analyzeArticle(text) {
  if (!text || text.trim().length < 50) {
    return null;
  }

  const stance = analyzeStance(text);
  const biasedSentences = detectBiasedSentences(text);
  const emotionalWords = analyzeEmotionalWords(text);
  const suggestions = generatePerspectiveSuggestions(stance, emotionalWords);

  // 计算综合偏见指数（0-100）
  const biasIndex = Math.min(
    100,
    Math.round(
      (biasedSentences.length * 10 +
        emotionalWords.emotionalDensity * 0.5 +
        (stance.stance !== 'neutral' ? 20 : 0)) /
        2
    )
  );

  return {
    stance,
    biasedSentences,
    emotionalWords,
    suggestions,
    biasIndex,
    biasLevel:
      biasIndex > 60 ? '高度偏见' : biasIndex > 30 ? '中度偏见' : '轻微偏见',
    wordCount: text.replace(/\s/g, '').length,
    sentenceCount: text.split(/[。！？\n]+/).filter((s) => s.trim().length > 5).length,
  };
}
