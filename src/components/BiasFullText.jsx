import { useRef, useEffect } from 'react';

/**
 * 将原文按句子分割，高亮有偏见的句子
 * 点击高亮句子触发 onSentenceClick(biasIndex)
 */
export default function BiasFullText({ text, biasedSentences, activeBiasIndex, onSentenceClick }) {
  const activeRef = useRef(null);

  // 当 activeBiasIndex 变化时，左侧滚动到对应高亮句子
  useEffect(() => {
    if (activeBiasIndex !== null && activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeBiasIndex]);

  if (!text) return null;

  // 构建偏见句子的 Map，key 为句子文本，value 为偏见索引
  const biasMap = new Map();
  biasedSentences.forEach((item, idx) => {
    biasMap.set(item.sentence.trim(), idx);
  });

  // 将原文按段落分割，再在段落内匹配偏见句子
  const paragraphs = text.split(/\n+/);

  return (
    <div className="text-sm text-slate-700 leading-8 select-text">
      {paragraphs.map((para, pIdx) => {
        if (!para.trim()) return <div key={pIdx} className="h-3" />;

        // 在段落内查找偏见句子并高亮
        const rendered = renderParagraph(para, biasMap, activeBiasIndex, onSentenceClick, activeRef);

        return (
          <p key={pIdx} className="mb-4">
            {rendered}
          </p>
        );
      })}
    </div>
  );
}

function renderParagraph(para, biasMap, activeBiasIndex, onSentenceClick, activeRef) {
  // 将段落切分为：偏见句子 + 普通文本
  const result = [];
  let cursor = 0;

  // 收集所有偏见句子在段落中的位置
  const matches = [];
  biasMap.forEach((biasIdx, sentence) => {
    let searchFrom = 0;
    while (true) {
      const pos = para.indexOf(sentence, searchFrom);
      if (pos === -1) break;
      matches.push({ start: pos, end: pos + sentence.length, sentence, biasIdx });
      searchFrom = pos + 1;
    }
  });

  // 按位置排序，去除重叠
  matches.sort((a, b) => a.start - b.start);
  const deduped = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      deduped.push(m);
      lastEnd = m.end;
    }
  }

  // 构建渲染片段
  for (const m of deduped) {
    // 普通文本（偏见句子之前）
    if (cursor < m.start) {
      result.push(
        <span key={`plain-${cursor}`} className="text-slate-700">
          {para.slice(cursor, m.start)}
        </span>
      );
    }
    // 偏见高亮句子
    const isActive = activeBiasIndex === m.biasIdx;
    result.push(
      <span
        key={`bias-${m.biasIdx}`}
        ref={isActive ? activeRef : null}
        onClick={() => onSentenceClick(m.biasIdx)}
        className={`cursor-pointer rounded px-0.5 transition-all duration-200 ${
          isActive
            ? 'bg-orange-300 text-orange-900 shadow-sm ring-2 ring-orange-400 ring-offset-1'
            : 'bg-orange-100 text-orange-800 hover:bg-orange-200 underline decoration-orange-400 decoration-dotted underline-offset-2'
        }`}
        title="点击定位到右侧偏见详情"
      >
        {m.sentence}
      </span>
    );
    cursor = m.end;
  }

  // 剩余普通文本
  if (cursor < para.length) {
    result.push(
      <span key={`plain-end-${cursor}`} className="text-slate-700">
        {para.slice(cursor)}
      </span>
    );
  }

  return result.length > 0 ? result : para;
}
