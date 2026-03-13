'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Shield, 
  DollarSign, 
  Scale, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Bot,
  Users,
  Gavel,
  Wallet
} from 'lucide-react';
import { reviewContract } from '@/services/contract-review-orchestrator';
import { 
  ContractReviewResult, 
  ReviewProgress, 
  RiskLevel,
  RectificationSuggestion 
} from '@/types/contract-review';

// 风险等级颜色映射
const riskLevelColors: Record<RiskLevel, { bg: string; text: string; border: string; icon: typeof AlertTriangle }> = {
  '高': { 
    bg: 'bg-red-50', 
    text: 'text-red-700', 
    border: 'border-red-200',
    icon: XCircle
  },
  '中': { 
    bg: 'bg-yellow-50', 
    text: 'text-yellow-700', 
    border: 'border-yellow-200',
    icon: AlertTriangle
  },
  '低': { 
    bg: 'bg-green-50', 
    text: 'text-green-700', 
    border: 'border-green-200',
    icon: CheckCircle
  },
};

// Agent图标映射
const agentIcons = {
  'task-distribution-agent': Bot,
  'subject-risk-agent': Users,
  'payment-node-agent': Wallet,
  'legal-clause-agent': Gavel,
  'summary-agent': CheckCircle,
};

export default function ContractReviewPage() {
  const [contractText, setContractText] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [progress, setProgress] = useState<ReviewProgress | null>(null);
  const [result, setResult] = useState<ContractReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));

  const handleReview = useCallback(async () => {
    if (!contractText.trim()) {
      setError('请输入合同文本');
      return;
    }

    setIsReviewing(true);
    setError(null);
    setResult(null);

    try {
      const reviewResult = await reviewContract(contractText, (p) => {
        setProgress(p);
      });
      setResult(reviewResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '审查过程中发生错误');
    } finally {
      setIsReviewing(false);
      setProgress(null);
    }
  }, [contractText]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const renderRiskBadge = (level: RiskLevel) => {
    const colors = riskLevelColors[level];
    const Icon = colors.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
        <Icon className="w-4 h-4" />
        {level}风险
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Bot className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI合同审查助手</h1>
              <p className="text-slate-400">多Agent智能协作 · 专业合同风险审查</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  合同文本
                </h2>
                <button
                  onClick={() => setContractText('')}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  清空
                </button>
              </div>
              <textarea
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
                placeholder="请粘贴合同文本内容..."
                className="w-full h-96 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
              />
              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleReview}
                disabled={isReviewing || !contractText.trim()}
                className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isReviewing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    审查中...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    开始审查
                  </>
                )}
              </button>
            </div>

            {/* Progress */}
            <AnimatePresence>
              {isReviewing && progress && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">审查进度</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{progress.stage}</span>
                      <span className="text-blue-400">{progress.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-sm text-slate-400">{progress.message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {!result && !isReviewing && (
              <div className="bg-slate-800/30 rounded-2xl p-12 border border-slate-700/30 text-center">
                <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">等待审查</h3>
                <p className="text-slate-500">在左侧输入合同文本后点击&quot;开始审查&quot;</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Overall Assessment */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">整体风险评估</h2>
                    {renderRiskBadge(result.summaryResult!.overallRiskLevel)}
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {result.summaryResult!.finalAdvice}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-slate-400">建议签订：</span>
                    <span className={`text-sm font-medium ${result.summaryResult!.shouldSign ? 'text-green-400' : 'text-red-400'}`}>
                      {result.summaryResult!.shouldSign ? '是' : '否'}
                    </span>
                  </div>
                </motion.div>

                {/* Subject Risk */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection('subject')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-white">主体公司风险</h3>
                        <p className="text-sm text-slate-400">审查双方主体资质、授权、信用状况</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderRiskBadge(result.subjectRiskResult!.overallRiskLevel)}
                      {expandedSections.has('subject') ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedSections.has('subject') && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 space-y-4">
                          {result.subjectRiskResult!.companies.map((company, idx) => (
                            <div key={idx} className="bg-slate-900/50 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-1 bg-slate-700 rounded text-sm text-slate-300">
                                  {company.role}
                                </span>
                                <span className="font-medium text-white">{company.name}</span>
                              </div>
                              {company.riskPoints.length > 0 ? (
                                <div className="space-y-2">
                                  {company.riskPoints.map((risk) => (
                                    <div
                                      key={risk.id}
                                      className={`p-3 rounded-lg border ${riskLevelColors[risk.riskLevel].bg} ${riskLevelColors[risk.riskLevel].border}`}
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        {renderRiskBadge(risk.riskLevel)}
                                      </div>
                                      <p className={`text-sm ${riskLevelColors[risk.riskLevel].text}`}>
                                        {risk.description}
                                      </p>
                                      <p className="text-sm text-slate-400 mt-2">
                                        建议：{risk.suggestion}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-green-400 text-sm">未发现明显风险</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Payment Node */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection('payment')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Wallet className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-white">付款节点审查</h3>
                        <p className="text-sm text-slate-400">审查付款比例、节点、条件合规性</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderRiskBadge(result.paymentNodeResult!.overallRiskLevel)}
                      {expandedSections.has('payment') ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedSections.has('payment') && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 space-y-4">
                          {/* Payment Nodes */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-900/50 rounded-xl p-4">
                              <p className="text-sm text-slate-400 mb-1">是否存在预付款</p>
                              <p className={`font-medium ${result.paymentNodeResult!.hasAdvancePayment ? 'text-red-400' : 'text-green-400'}`}>
                                {result.paymentNodeResult!.hasAdvancePayment ? '是' : '否'}
                              </p>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-4">
                              <p className="text-sm text-slate-400 mb-1">工程完成后付款比例</p>
                              <p className={`font-medium ${result.paymentNodeResult!.completionPaymentProportion > 90 ? 'text-red-400' : 'text-green-400'}`}>
                                {result.paymentNodeResult!.completionPaymentProportion}%
                              </p>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-4">
                              <p className="text-sm text-slate-400 mb-1">质保金比例</p>
                              <p className={`font-medium ${result.paymentNodeResult!.warrantyProportion < 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                                {result.paymentNodeResult!.warrantyProportion}%
                              </p>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-4">
                              <p className="text-sm text-slate-400 mb-1">质保期</p>
                              <p className="font-medium text-slate-200">
                                {result.paymentNodeResult!.warrantyPeriod || '未明确'}
                              </p>
                            </div>
                          </div>

                          {/* Violations */}
                          {result.paymentNodeResult!.violations.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-slate-300">违规项</h4>
                              {result.paymentNodeResult!.violations.map((violation) => (
                                <div
                                  key={violation.id}
                                  className={`p-3 rounded-lg border ${riskLevelColors[violation.riskLevel].bg} ${riskLevelColors[violation.riskLevel].border}`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    {renderRiskBadge(violation.riskLevel)}
                                  </div>
                                  <p className={`text-sm ${riskLevelColors[violation.riskLevel].text}`}>
                                    {violation.description}
                                  </p>
                                  <p className="text-sm text-slate-400 mt-2">
                                    建议：{violation.suggestion}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Legal Clause */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection('legal')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Scale className="w-5 h-5 text-orange-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-white">法律条款审查</h3>
                        <p className="text-sm text-slate-400">审查法律条款准确性、时效性、适用性</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderRiskBadge(result.legalClauseResult!.overallRiskLevel)}
                      {expandedSections.has('legal') ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedSections.has('legal') && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 space-y-4">
                          {/* Cited Clauses */}
                          {result.legalClauseResult!.clauses.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-slate-300">引用的法律条款</h4>
                              {result.legalClauseResult!.clauses.map((clause) => (
                                <div
                                  key={clause.id}
                                  className={`p-3 rounded-lg border ${
                                    clause.isValid && clause.isAccurate
                                      ? 'bg-green-500/10 border-green-500/20'
                                      : 'bg-red-500/10 border-red-500/20'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-slate-200 font-medium">
                                      {clause.citedLaw}
                                      {clause.clauseNumber && ` 第${clause.clauseNumber}条`}
                                    </span>
                                    {!clause.isValid ? (
                                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                                        已废止
                                      </span>
                                    ) : !clause.isAccurate ? (
                                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                        编号错误
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                                        合规
                                      </span>
                                    )}
                                  </div>
                                  {clause.issues.length > 0 && (
                                    <div className="space-y-1">
                                      {clause.issues.map((issue, idx) => (
                                        <p key={idx} className="text-sm text-red-400">
                                          • {issue}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                  {clause.correction && (
                                    <p className="text-sm text-green-400 mt-2">
                                      修正：{clause.correction}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Missing Clauses */}
                          {result.legalClauseResult!.missingClauses.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-slate-300">缺失的必要条款</h4>
                              {result.legalClauseResult!.missingClauses.map((missing, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                                >
                                  <p className="text-sm text-yellow-400">• {missing}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Rectification Suggestions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection('suggestions')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-white">整改建议清单</h3>
                        <p className="text-sm text-slate-400">按优先级排序的整改建议</p>
                      </div>
                    </div>
                    {expandedSections.has('suggestions') ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedSections.has('suggestions') && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 space-y-3">
                          {result.summaryResult!.rectificationSuggestions.map((suggestion) => (
                            <div
                              key={suggestion.id}
                              className={`p-4 rounded-xl border ${riskLevelColors[suggestion.riskLevel].bg} ${riskLevelColors[suggestion.riskLevel].border}`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-slate-700 rounded-full text-xs text-slate-300">
                                  {suggestion.priority}
                                </span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {renderRiskBadge(suggestion.riskLevel)}
                                    <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                                      {suggestion.module}
                                    </span>
                                  </div>
                                  <p className={`text-sm ${riskLevelColors[suggestion.riskLevel].text} mb-2`}>
                                    {suggestion.issue}
                                  </p>
                                  <p className="text-sm text-slate-400">
                                    建议：{suggestion.suggestion}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Full Report */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection('report')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-500/20 rounded-lg">
                        <FileText className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-white">完整审查报告</h3>
                        <p className="text-sm text-slate-400">查看完整的文本格式报告</p>
                      </div>
                    </div>
                    {expandedSections.has('report') ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedSections.has('report') && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <pre className="bg-slate-900/50 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                            {result.summaryResult!.fullReport}
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
