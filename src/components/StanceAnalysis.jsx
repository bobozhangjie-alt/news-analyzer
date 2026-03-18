import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

const stanceConfig = {
  left: {
    label: '偏左',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    barColor: 'bg-blue-500',
    icon: TrendingDown,
    iconColor: 'text-blue-500',
  },
  'slight-left': {
    label: '轻微偏左',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    barColor: 'bg-blue-400',
    icon: TrendingDown,
    iconColor: 'text-blue-400',
  },
  neutral: {
    label: '中立',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    barColor: 'bg-green-500',
    icon: Minus,
    iconColor: 'text-green-500',
  },
  'slight-right': {
    label: '轻微偏右',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    barColor: 'bg-orange-400',
    icon: TrendingUp,
    iconColor: 'text-orange-400',
  },
  right: {
    label: '偏右',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    barColor: 'bg-red-500',
    icon: TrendingUp,
    iconColor: 'text-red-500',
  },
};

export default function StanceAnalysis({ stance }) {
  const config = stanceConfig[stance.stance] || stanceConfig.neutral;
  const Icon = config.icon;

  // 计算左右比例
  const total = stance.leftScore + stance.rightScore;
  const leftPct = total > 0 ? Math.round((stance.leftScore / total) * 100) : 50;
  const rightPct = total > 0 ? Math.round((stance.rightScore / total) * 100) : 50;

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} p-6`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.bg} border ${config.border}`}>
          <Icon size={18} className={config.iconColor} />
        </div>
        <h3 className="font-semibold text-gray-800 text-lg">立场分析</h3>
      </div>

      {/* 立场标签 */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`text-3xl font-bold ${config.color}`}>{stance.stanceLabel}</span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color} border ${config.border}`}>
          {stance.stance === 'neutral' ? '客观中立' : `${stance.stanceScore}% 倾向`}
        </span>
      </div>

      {/* 描述 */}
      <p className="text-gray-600 text-sm mb-5 leading-relaxed">{stance.description}</p>

      {/* 左右倾向光谱条 */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span className="text-blue-500 font-medium">← 偏左 ({leftPct}%)</span>
          <span className="text-red-500 font-medium">偏右 ({rightPct}%) →</span>
        </div>
        <div className="h-3 rounded-full bg-gray-200 overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-700"
            style={{ width: `${leftPct}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-red-300 to-red-500 transition-all duration-700"
            style={{ width: `${rightPct}%` }}
          />
        </div>
        {/* 中间指示器 */}
        <div className="relative h-2 mt-1">
          <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-2 bg-gray-400 rounded" />
          <span className="absolute left-1/2 -translate-x-1/2 top-2 text-xs text-gray-400">中立</span>
        </div>
      </div>

      {/* 关键词统计 */}
      {(stance.leftMatches.length > 0 || stance.rightMatches.length > 0) && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {stance.leftMatches.length > 0 && (
            <div className="bg-white rounded-xl p-3 border border-blue-100">
              <div className="text-xs text-blue-500 font-medium mb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                左倾关键词
              </div>
              <div className="flex flex-wrap gap-1">
                {stance.leftMatches.map(({ keyword, count }) => (
                  <span key={keyword} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                    {keyword} ×{count}
                  </span>
                ))}
              </div>
            </div>
          )}
          {stance.rightMatches.length > 0 && (
            <div className="bg-white rounded-xl p-3 border border-red-100">
              <div className="text-xs text-red-500 font-medium mb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                右倾关键词
              </div>
              <div className="flex flex-wrap gap-1">
                {stance.rightMatches.map(({ keyword, count }) => (
                  <span key={keyword} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
                    {keyword} ×{count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 提示 */}
      <div className="mt-4 flex items-start gap-2 text-xs text-gray-400 bg-white/60 rounded-lg p-2">
        <Info size={12} className="mt-0.5 flex-shrink-0" />
        <span>立场分析基于关键词频率统计，仅供参考，不代表绝对判断</span>
      </div>
    </div>
  );
}
