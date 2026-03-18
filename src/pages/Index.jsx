import { useState, useCallback, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  Search,
  BookOpen,
  Globe,
  BarChart2,
  MessageSquare,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
  Eye,
  Flame,
  Shield,
  FileText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { analyzeArticle } from '@/lib/biasAnalyzer';
import BiasFullText from '@/components/BiasFullText';

// 立场颜色映射
const STANCE_CONFIG = {
  left: {
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    label: '偏左',
    icon: TrendingDown,
    barColor: 'bg-blue-500',
  },
  'slight-left': {
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    badge: 'bg-blue-50 text-blue-600',
    label: '轻微偏左',
    icon: TrendingDown,
    barColor: 'bg-blue-400',
  },
  neutral: {
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    label: '中立',
    icon: Minus,
    barColor: 'bg-green-500',
  },
  'slight-right': {
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    badge: 'bg-orange-50 text-orange-600',
    label: '轻微偏右',
    icon: TrendingUp,
    barColor: 'bg-orange-400',
  },
  right: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    label: '偏右',
    icon: TrendingUp,
    barColor: 'bg-red-500',
  },
};

// 偏见类型标签
const BIAS_TYPE_LABELS = {
  source: { label: '来源可疑', color: 'bg-yellow-100 text-yellow-700' },
  absolute: { label: '绝对化表述', color: 'bg-orange-100 text-orange-700' },
  assumption: { label: '预设立场', color: 'bg-purple-100 text-purple-700' },
  labeling: { label: '标签化', color: 'bg-red-100 text-red-700' },
  binary: { label: '二元对立', color: 'bg-pink-100 text-pink-700' },
  emotional: { label: '情绪渲染', color: 'bg-rose-100 text-rose-700' },
};

// 建议图标映射
const SUGGESTION_ICONS = {
  balance: Shield,
  neutral: Eye,
  verify: Search,
  global: Globe,
  explore: BookOpen,
};

const SAMPLE_ARTICLES = [
  {
    id: 1,
    title: '经济政策争议',
    tag: '偏右 · 高情绪',
    tagColor: 'text-red-500',
    text: '近日，政府宣布了一项新的经济刺激计划，显然这是一个彻底失败的政策。所有经济学家都认为，这种激进的财政干预只会加剧通货膨胀，摧毁市场信心。那些支持这项政策的人不过是一群不懂经济的政客，他们的目的只是为了讨好选民。\n\n据不愿透露姓名的消息人士称，政府内部对此政策存在严重分歧，多名高级官员已经表达了强烈反对。这种混乱局面必然导致经济崩溃，普通民众将成为最终的受害者。\n\n当然，反对派的批评也是完全正确的。他们指出，这项政策从根本上违背了自由市场原则，政府干预只会带来更多问题。历史证明，每一次政府试图控制市场，结果都是灾难性的。',
  },
  {
    id: 2,
    title: '环境保护报道',
    tag: '偏左 · 中情绪',
    tagColor: 'text-blue-500',
    text: '气候变化已经成为我们这个时代最紧迫的危机，而那些否认气候变化的人正在将整个人类推向灾难的深渊。科学界早已达成共识，但某些利益集团为了维护自身的经济利益，不惜散布谎言，阻碍可再生能源的发展。\n\n弱势群体和发展中国家将首当其冲地承受气候变化带来的恶果，而那些制造最多碳排放的富裕国家却迟迟不肯承担应有的责任。这种不平等是对社会公平的严重践踏。\n\n我们需要立即采取行动，推动系统性变革，加强政府监管，向化石燃料企业征收重税，将资金用于支持清洁能源转型和受影响社区的社会保障。只有通过集体行动，我们才能拯救这个星球。',
  },
  {
    id: 3,
    title: '移民政策分析',
    tag: '中立 · 低情绪',
    tagColor: 'text-green-500',
    text: '近期，政府公布了新的移民政策调整方案，该方案在社会各界引发了广泛讨论。根据官方数据，过去五年间，移民人口增长了约12%，主要集中在制造业和服务业领域。\n\n支持者认为，移民为经济发展提供了必要的劳动力补充，有助于缓解部分行业的用工短缺问题。反对者则担忧，大规模移民可能对本地就业市场造成压力，并带来一定的社会融合挑战。\n\n多位经济学家指出，移民政策的影响因地区和行业而存在显著差异，需要结合具体数据进行评估。政策制定者表示，将在广泛征求各方意见的基础上，对方案进行进一步完善。',
  },
  {
    id: 4,
    title: '社会福利改革',
    tag: '偏左 · 高情绪',
    tagColor: 'text-blue-600',
    text: '政府最新提出的社会福利改革方案，是对广大劳动人民权益的严重侵害。那些高高在上的精英阶层永远不会理解，削减社会保障对普通家庭意味着什么——这是真实的痛苦，是孩子们失去医疗保障的绝望。\n\n工人权益保护组织发出强烈谴责，认为这项改革完全是为了讨好资本家，将工薪阶层的血汗钱拱手相让。所有有良知的公民都应该站出来，反对这种赤裸裸的阶级剥削。\n\n历史上每一次削减社会福利的改革，最终都以失败告终，因为它们从根本上违背了社会公平的基本原则。我们必须团结起来，通过集体行动捍卫我们的权利，绝不允许这种倒退发生。',
  },
];

export default function Index() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedSentences, setExpandedSentences] = useState({});
  const [activeTab, setActiveTab] = useState('stance');
  const [activeBiasIndex, setActiveBiasIndex] = useState(null);

  // 右侧偏见列表自动滚动到激活条目
  useEffect(() => {
    if (activeBiasIndex === null) return;
    const el = document.getElementById(`bias-item-${activeBiasIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeBiasIndex]);

  const handleAnalyze = useCallback(() => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const analysisResult = analyzeArticle(inputText);
      setResult(analysisResult);
      setIsAnalyzing(false);
      setActiveTab('stance');
      setActiveBiasIndex(null);
    }, 800);
  }, [inputText]);

  const [showSampleMenu, setShowSampleMenu] = useState(false);

  const handleSample = (article) => {
    setInputText(article.text);
    setResult(null);
    setExpandedSentences({});
  };

  const handleReset = () => {
    setInputText('');
    setResult(null);
    setExpandedSentences({});
    setActiveBiasIndex(null);
  };

  const toggleSentence = (index) => {
    setExpandedSentences((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const stanceConfig = result ? STANCE_CONFIG[result.stance.stance] || STANCE_CONFIG.neutral : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">新闻偏见检测器</h1>
              <p className="text-xs text-slate-500">识别媒体偏见，批判性阅读新闻</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 hidden sm:flex">
              <Zap className="w-3 h-3 mr-1 text-yellow-500" />
              智能分析
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* 输入区域 */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              粘贴新闻文章
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="将新闻文章全文粘贴到此处，系统将自动分析文章的立场倾向、偏见句子、情绪词汇等..."
              className="min-h-[180px] text-sm text-slate-700 resize-none border-slate-200 focus:border-indigo-300 focus:ring-indigo-200 leading-relaxed"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DropdownMenu open={showSampleMenu} onOpenChange={setShowSampleMenu}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-slate-500 border-slate-200 hover:bg-slate-50"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      加载示例
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel className="text-xs text-slate-400 font-normal">选择示例文章</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {SAMPLE_ARTICLES.map((article) => (
                      <DropdownMenuItem
                        key={article.id}
                        onClick={() => handleSample(article)}
                        className="flex items-start gap-2 py-2.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 mt-0.5 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-700">{article.title}</div>
                          <div className={`text-xs mt-0.5 ${article.tagColor}`}>{article.tag}</div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {(inputText || result) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    重置
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {inputText && (
                  <span className="text-xs text-slate-400">
                    {inputText.replace(/\s/g, '').length} 字
                  </span>
                )}
                <Button
                  onClick={handleAnalyze}
                  disabled={!inputText.trim() || isAnalyzing}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm text-sm px-5"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      开始分析
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 分析结果 */}
        {result && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 综合评分卡 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 立场卡 */}
              <Card className={`border ${stanceConfig.border} ${stanceConfig.bg} shadow-sm`}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">整体立场</span>
                    <stanceConfig.icon className={`w-4 h-4 ${stanceConfig.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${stanceConfig.color}`}>
                    {result.stance.stanceLabel}
                  </div>
                  <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stanceConfig.barColor} rounded-full transition-all duration-700`}
                      style={{ width: `${result.stance.stanceScore}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{result.stance.stanceScore}% 置信度</div>
                </CardContent>
              </Card>

              {/* 偏见指数卡 */}
              <Card className={`border shadow-sm ${result.biasIndex > 60 ? 'border-red-200 bg-red-50' : result.biasIndex > 30 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">偏见指数</span>
                    <AlertTriangle className={`w-4 h-4 ${result.biasIndex > 60 ? 'text-red-500' : result.biasIndex > 30 ? 'text-orange-500' : 'text-green-500'}`} />
                  </div>
                  <div className={`text-2xl font-bold ${result.biasIndex > 60 ? 'text-red-600' : result.biasIndex > 30 ? 'text-orange-600' : 'text-green-600'}`}>
                    {result.biasIndex}
                    <span className="text-sm font-normal ml-1">/ 100</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${result.biasIndex > 60 ? 'bg-red-500' : result.biasIndex > 30 ? 'bg-orange-500' : 'bg-green-500'}`}
                      style={{ width: `${result.biasIndex}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{result.biasLevel}</div>
                </CardContent>
              </Card>

              {/* 情绪化程度卡 */}
              <Card className={`border shadow-sm ${result.emotionalWords.emotionalDensity > 60 ? 'border-rose-200 bg-rose-50' : result.emotionalWords.emotionalDensity > 30 ? 'border-amber-200 bg-amber-50' : 'border-teal-200 bg-teal-50'}`}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">情绪化程度</span>
                    <Flame className={`w-4 h-4 ${result.emotionalWords.emotionalDensity > 60 ? 'text-rose-500' : result.emotionalWords.emotionalDensity > 30 ? 'text-amber-500' : 'text-teal-500'}`} />
                  </div>
                  <div className={`text-2xl font-bold ${result.emotionalWords.emotionalDensity > 60 ? 'text-rose-600' : result.emotionalWords.emotionalDensity > 30 ? 'text-amber-600' : 'text-teal-600'}`}>
                    {result.emotionalWords.emotionalDensity}
                    <span className="text-sm font-normal ml-1">/ 100</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${result.emotionalWords.emotionalDensity > 60 ? 'bg-rose-500' : result.emotionalWords.emotionalDensity > 30 ? 'bg-amber-500' : 'bg-teal-500'}`}
                      style={{ width: `${result.emotionalWords.emotionalDensity}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{result.emotionalWords.level}</div>
                </CardContent>
              </Card>
            </div>

            {/* 详细分析标签页 */}
            <Card className="shadow-sm border-slate-200">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b border-slate-100 px-4">
                  <TabsList className="bg-transparent h-12 gap-1 p-0">
                    <TabsTrigger
                      value="stance"
                      className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none rounded-lg text-xs font-medium px-3 h-9"
                    >
                      <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
                      立场分析
                    </TabsTrigger>
                    <TabsTrigger
                      value="bias"
                      className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-none rounded-lg text-xs font-medium px-3 h-9"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                      偏见标注
                      {result.biasedSentences.length > 0 && (
                        <span className="ml-1.5 bg-orange-100 text-orange-600 text-xs rounded-full px-1.5 py-0.5 leading-none">
                          {result.biasedSentences.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="emotion"
                      className="data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700 data-[state=active]:shadow-none rounded-lg text-xs font-medium px-3 h-9"
                    >
                      <Flame className="w-3.5 h-3.5 mr-1.5" />
                      情绪词汇
                    </TabsTrigger>
                    <TabsTrigger
                      value="suggestions"
                      className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 data-[state=active]:shadow-none rounded-lg text-xs font-medium px-3 h-9"
                    >
                      <Globe className="w-3.5 h-3.5 mr-1.5" />
                      多角度建议
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* 立场分析 */}
                <TabsContent value="stance" className="p-5 space-y-5 mt-0">
                  <div className={`rounded-xl p-4 ${stanceConfig.bg} border ${stanceConfig.border}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stanceConfig.badge} flex-shrink-0`}>
                        <stanceConfig.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold text-base ${stanceConfig.color}`}>
                            {result.stance.stanceLabel}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${stanceConfig.badge}`}>
                            {result.stance.stanceScore}% 置信度
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{result.stance.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* 左右倾向词汇分布 */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-slate-400" />
                      立场词汇分布
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" /> 左倾词汇
                          </span>
                          <span className="text-xs text-slate-400">{result.stance.leftScore} 处</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-400 rounded-full transition-all duration-700"
                            style={{
                              width: `${result.stance.leftScore + result.stance.rightScore > 0
                                ? (result.stance.leftScore / (result.stance.leftScore + result.stance.rightScore)) * 100
                                : 50}%`,
                            }}
                          />
                        </div>
                        {result.stance.leftMatches.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {result.stance.leftMatches.map(({ keyword, count }) => (
                              <span key={keyword} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                                {keyword} ×{count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> 右倾词汇
                          </span>
                          <span className="text-xs text-slate-400">{result.stance.rightScore} 处</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-400 rounded-full transition-all duration-700"
                            style={{
                              width: `${result.stance.leftScore + result.stance.rightScore > 0
                                ? (result.stance.rightScore / (result.stance.leftScore + result.stance.rightScore)) * 100
                                : 50}%`,
                            }}
                          />
                        </div>
                        {result.stance.rightMatches.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {result.stance.rightMatches.map(({ keyword, count }) => (
                              <span key={keyword} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
                                {keyword} ×{count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 文章统计 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-slate-700">{result.wordCount}</div>
                      <div className="text-xs text-slate-400 mt-0.5">总字数</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-slate-700">{result.sentenceCount}</div>
                      <div className="text-xs text-slate-400 mt-0.5">句子数</div>
                    </div>
                  </div>
                </TabsContent>

                {/* 偏见标注 */}
                <TabsContent value="bias" className="mt-0">
                  {result.biasedSentences.length === 0 ? (
                    <div className="text-center py-10 p-5">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">未检测到明显偏见句子</p>
                      <p className="text-slate-400 text-xs mt-1">文章表述较为客观中性</p>
                    </div>
                  ) : (
                    <div className="flex h-[520px]">
                      {/* 左侧：全文高亮 */}
                      <div className="w-1/2 border-r border-slate-100 flex flex-col">
                        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2 flex-shrink-0">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-medium text-slate-500">原文全文</span>
                          <span className="ml-auto text-xs text-slate-400">点击高亮句子定位</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                          <BiasFullText
                            text={inputText}
                            biasedSentences={result.biasedSentences}
                            activeBiasIndex={activeBiasIndex}
                            onSentenceClick={(idx) => {
                              setActiveBiasIndex(idx);
                              setExpandedSentences((prev) => ({ ...prev, [idx]: true }));
                            }}
                          />
                        </div>
                      </div>
                      {/* 右侧：偏见列表 */}
                      <div className="w-1/2 flex flex-col">
                        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2 flex-shrink-0">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                          <span className="text-xs font-medium text-slate-500">偏见句子</span>
                          <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                            {result.biasedSentences.length} 处
                          </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                          {result.biasedSentences.map((item, index) => (
                            <div
                              key={index}
                              id={`bias-item-${index}`}
                              className={`rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer ${
                                activeBiasIndex === index
                                  ? item.severity === 'high'
                                    ? 'border-red-400 bg-red-50 ring-2 ring-red-200'
                                    : 'border-orange-400 bg-orange-50 ring-2 ring-orange-200'
                                  : item.severity === 'high'
                                  ? 'border-red-200 bg-red-50/40 hover:border-red-300'
                                  : 'border-orange-200 bg-orange-50/40 hover:border-orange-300'
                              }`}
                              onClick={() => {
                                setActiveBiasIndex(index);
                                setExpandedSentences((prev) => ({ ...prev, [index]: true }));
                              }}
                            >
                              <div className="p-3 flex items-start gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  item.severity === 'high' ? 'bg-red-100' : 'bg-orange-100'
                                }`}>
                                  <AlertTriangle className={`w-3 h-3 ${item.severity === 'high' ? 'text-red-500' : 'text-orange-500'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs leading-relaxed font-medium line-clamp-2 ${
                                    item.severity === 'high' ? 'text-red-800' : 'text-orange-800'
                                  }`}>
                                    {item.sentence}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {item.reasons.map((r, i) => (
                                      <span
                                        key={i}
                                        className={`text-xs px-1.5 py-0.5 rounded-full ${BIAS_TYPE_LABELS[r.type]?.color || 'bg-gray-100 text-gray-600'}`}
                                      >
                                        {BIAS_TYPE_LABELS[r.type]?.label || r.type}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <button
                                  className="flex-shrink-0 mt-0.5"
                                  onClick={(e) => { e.stopPropagation(); toggleSentence(index); }}
                                >
                                  {expandedSentences[index]
                                    ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                    : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                                </button>
                              </div>
                              {expandedSentences[index] && (
                                <div className="px-3 pb-3 border-t border-white/60 space-y-1.5 pt-2">
                                  {item.reasons.map((r, i) => (
                                    <div key={i} className="flex items-start gap-1.5">
                                      <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${BIAS_TYPE_LABELS[r.type]?.color || 'bg-gray-100 text-gray-600'}`}>
                                        {BIAS_TYPE_LABELS[r.type]?.label || r.type}
                                      </span>
                                      <p className="text-xs text-slate-600 leading-relaxed">{r.reason}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* 情绪词汇 */}
                <TabsContent value="emotion" className="p-5 mt-0 space-y-5">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      result.emotionalWords.emotionalDensity > 60 ? 'bg-rose-100' :
                      result.emotionalWords.emotionalDensity > 30 ? 'bg-amber-100' : 'bg-teal-100'
                    }`}>
                      <Flame className={`w-6 h-6 ${
                        result.emotionalWords.emotionalDensity > 60 ? 'text-rose-500' :
                        result.emotionalWords.emotionalDensity > 30 ? 'text-amber-500' : 'text-teal-500'
                      }`} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-700">{result.emotionalWords.level}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        共检测到 {result.emotionalWords.totalEmotional} 个情绪化词汇
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className={`text-2xl font-bold ${
                        result.emotionalWords.emotionalDensity > 60 ? 'text-rose-600' :
                        result.emotionalWords.emotionalDensity > 30 ? 'text-amber-600' : 'text-teal-600'
                      }`}>
                        {result.emotionalWords.emotionalDensity}
                      </div>
                      <div className="text-xs text-slate-400">情绪指数</div>
                    </div>
                  </div>

                  {/* 负面情绪词 */}
                  {result.emotionalWords.negative.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                        负面情绪词汇
                        <span className="text-xs text-slate-400 font-normal">({result.emotionalWords.negative.length}个)</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.emotionalWords.negative.map(({ word, count }) => (
                          <div key={word} className="flex items-center gap-1 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
                            <span className="text-sm text-red-700 font-medium">{word}</span>
                            {count > 1 && (
                              <span className="text-xs text-red-400 bg-red-100 rounded-full px-1.5 py-0.5 leading-none">×{count}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 正面情绪词 */}
                  {result.emotionalWords.positive.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                        正面情绪词汇
                        <span className="text-xs text-slate-400 font-normal">({result.emotionalWords.positive.length}个)</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.emotionalWords.positive.map(({ word, count }) => (
                          <div key={word} className="flex items-center gap-1 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                            <span className="text-sm text-green-700 font-medium">{word}</span>
                            {count > 1 && (
                              <span className="text-xs text-green-400 bg-green-100 rounded-full px-1.5 py-0.5 leading-none">×{count}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 强化词 */}
                  {result.emotionalWords.intensifiers.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                        绝对化/强化词汇
                        <span className="text-xs text-slate-400 font-normal">({result.emotionalWords.intensifiers.length}个)</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.emotionalWords.intensifiers.map(({ word, count }) => (
                          <div key={word} className="flex items-center gap-1 bg-purple-50 border border-purple-100 rounded-lg px-3 py-1.5">
                            <span className="text-sm text-purple-700 font-medium">{word}</span>
                            {count > 1 && (
                              <span className="text-xs text-purple-400 bg-purple-100 rounded-full px-1.5 py-0.5 leading-none">×{count}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.emotionalWords.totalEmotional === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-teal-400 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">未检测到明显情绪化词汇</p>
                      <p className="text-slate-400 text-xs mt-1">文章用词较为中性客观</p>
                    </div>
                  )}
                </TabsContent>

                {/* 多角度建议 */}
                <TabsContent value="suggestions" className="p-5 mt-0 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-slate-400" />
                    <p className="text-xs text-slate-500">以下建议帮助您获取更全面、平衡的信息视角</p>
                  </div>
                  {result.suggestions.map((suggestion, index) => {
                    const IconComponent = SUGGESTION_ICONS[suggestion.icon] || Globe;
                    const colors = [
                      { bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'bg-indigo-100 text-indigo-600', title: 'text-indigo-700', dot: 'bg-indigo-300' },
                      { bg: 'bg-teal-50', border: 'border-teal-100', icon: 'bg-teal-100 text-teal-600', title: 'text-teal-700', dot: 'bg-teal-300' },
                      { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'bg-amber-100 text-amber-600', title: 'text-amber-700', dot: 'bg-amber-300' },
                      { bg: 'bg-purple-50', border: 'border-purple-100', icon: 'bg-purple-100 text-purple-600', title: 'text-purple-700', dot: 'bg-purple-300' },
                      { bg: 'bg-rose-50', border: 'border-rose-100', icon: 'bg-rose-100 text-rose-600', title: 'text-rose-700', dot: 'bg-rose-300' },
                    ];
                    const color = colors[index % colors.length];
                    return (
                      <div key={index} className={`rounded-xl border ${color.border} ${color.bg} p-4`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color.icon}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold text-sm ${color.title} mb-1`}>{suggestion.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed mb-3">{suggestion.description}</p>
                            <div className="space-y-1.5">
                              {suggestion.examples.map((example, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${color.dot} flex-shrink-0 mt-1.5`} />
                                  <span className="text-xs text-slate-500 leading-relaxed">{example}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>
              </Tabs>
            </Card>

            {/* 免责声明 */}
            <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                本工具基于关键词词库和规则引擎进行分析，结果仅供参考，不代表对文章或媒体的最终评判。建议结合多方信息来源进行综合判断。
              </p>
            </div>
          </div>
        )}

        {/* 空状态引导 */}
        {!result && !isAnalyzing && (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto">
              <Eye className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-600 mb-2">开始检测新闻偏见</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                粘贴任意新闻文章，系统将自动分析文章的政治立场、偏见句子、情绪化词汇，并提供多角度阅读建议
              </p>
            </div>
            <div className="flex items-center justify-center gap-6 pt-2">
              {[
                { icon: BarChart2, label: '立场分析', color: 'text-indigo-400' },
                { icon: AlertTriangle, label: '偏见标注', color: 'text-orange-400' },
                { icon: Flame, label: '情绪识别', color: 'text-rose-400' },
                { icon: Globe, label: '多角度建议', color: 'text-teal-400' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
