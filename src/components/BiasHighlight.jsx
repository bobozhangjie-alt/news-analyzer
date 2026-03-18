import { AlertTriangle, AlertCircle, Tag, Quote, Binary, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const typeConfig = {
  source: { label: '来源可疑', color: 'bg-yellow-100 border-yellow-300 text-yellow-800', dot: 'bg-yellow-400', icon: HelpCircle },
  absolute: { label: '绝对化表述', color: 'bg-red-100 border-red-300 text-red-800', dot: 'bg-red-400', icon: AlertCircle },
  assumption: { label: '预设立场', color: 'bg-purple-100 border-purple-300 text-purple-800', dot: 'bg-purple-400', icon: Quote },
  labeling: { label: '标签化描述', color: 'bg-orange-100 border-orange-300 text-orange-800', dot: 'bg-orange-400', icon: Tag },
  binary: { label: '二元对立', color: 'bg-pink-100 border-pink-300 text-pink-800', dot: 'bg-pink-400', icon: Binary },
  emotional: { label: '情绪渲染', color: 'bg-rose-100 border-rose-300 text-rose-800', dot: 'bg-rose-400', icon: AlertTriangle },
};

const severityConfig = {
  high: { border: 'border-l-red-400', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', label: '高风险' },
  medium: { border: 'border-l-yellow-400', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700', label: '中风险' },
};

export default function BiasHighlight({ biasedSentences }) {
  const [expanded, setExpanded] = useState(null);

  if (!biasedSentences || biasedSentences.length === 0) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center">
            <AlertTriangle size={18} className="text-green-500" />
          </div>
          <h3 className="font-semibold text-gray-800 text-lg">偏见句子标注</h3>
        </div>
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
            <AlertTriangle size={28} className="text-green-400" />
          </div>
          <p className="text-green-700 font-medium">未检测到明显偏见句子</p>
          <p className="text-green-500 text-sm mt-1">文章表述较为客观，未发现明显的偏见模式</p>
        </div>
      </div>
    );
  }

  // 统计各类型数量
  const typeCounts = {};
  biasedSentences.forEach(({ reasons }) => {
    reasons.forEach(({ type }) => {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
  });

  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center">
            <AlertTriangle size={18} className="text-orange-500" />
          </div>
          <h3 className="font-semibold text-gray-800 text-lg">偏见句子标注</h3>
        </div>
        <span className="bg-orange-100 text-orange-700 text-sm font-medium px-3 py-1 rounded-full border border-orange-200">
          发现 {biasedSentences.length} 处
        </span>
      </div>

      {/* 偏见类型统计 */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(typeCounts).map(([type, count]) => {
          const cfg = typeConfig[type] || typeConfig.emotional;
          const TypeIcon = cfg.icon;
          return (
            <span key={type} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${cfg.color}`}>
              <TypeIcon size={11} />
              {cfg.label} ×{count}
            </span>
          );
        })}
      </div>

      {/* 偏见句子列表 */}
      <div className="space-y-3">
        {biasedSentences.map((item, idx) => {
          const sevCfg = severityConfig[item.severity] || severityConfig.medium;
          const isExpanded = expanded === idx;

          return (
            <div
              key={idx}
              className={`rounded-xl border-l-4 ${sevCfg.border} ${sevCfg.bg} border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200`}
              onClick={() => setExpanded(isExpanded ? null : idx)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span className="text-gray-400 text-xs font-mono mt-0.5 flex-shrink-0">#{idx + 1}</span>
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">{item.sentence}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sevCfg.badge}`}>
                      {sevCfg.label}
                    </span>
                    <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* 展开的原因列表 */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                    <p className="text-xs text-gray-500 font-medium mb-2">偏见原因分析：</p>
                    {item.reasons.map(({ reason, type }, rIdx) => {
                      const cfg = typeConfig[type] || typeConfig.emotional;
                      const ReasonIcon = cfg.icon;
                      return (
                        <div key={rIdx} className="flex items-start gap-2">
                          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.color}`}>
                            <ReasonIcon size={10} />
                            {cfg.label}
                          </span>
                          <span className="text-xs text-gray-600 leading-relaxed">{reason}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">点击句子可展开/收起详细原因</p>
    </div>
  );
}
