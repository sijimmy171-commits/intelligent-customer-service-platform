// 合同审查多Agent系统类型定义

// 风险等级
export type RiskLevel = '高' | '中' | '低';

// Agent类型
export type AgentType = 
  | 'task-distribution-agent'
  | 'subject-risk-agent'
  | 'payment-node-agent'
  | 'legal-clause-agent'
  | 'summary-agent';

// 审查任务状态
export type TaskStatus = 'pending' | 'assigned' | 'completed' | 'failed';

// 任务分派Agent输出
export interface TaskDistributionOutput {
  status: '任务分派完成' | '结果汇总完成';
  task_distribution: {
    主体风险审查: string;
    付款节点审查: string;
    法律条款审查: string;
  };
  received_results: {
    主体风险审查: boolean;
    付款节点审查: boolean;
    法律条款审查: boolean;
  };
  next_step: '提交总结Agent' | '等待补充结果';
}

// 风险点
export interface RiskPoint {
  id: string;
  description: string;
  riskLevel: RiskLevel;
  contractClause?: string;
  suggestion: string;
}

// 主体公司信息
export interface CompanyInfo {
  name: string;
  role: '甲方' | '乙方';
  qualifications: {
    businessLicenseValid: boolean;
    businessScopeMatch: boolean;
    specialIndustryLicense?: boolean;
    issues: string[];
  };
  authorization: {
    hasAuthorization: boolean;
    representativeInfo?: string;
    issues: string[];
  };
  creditStatus: {
    hasBadRecords: boolean;
    records: string[];
    performanceCapability: '良好' | '一般' | '差';
  };
  riskPoints: RiskPoint[];
}

// 主体风险审查结果
export interface SubjectRiskResult {
  agentType: 'subject-risk-agent';
  companies: CompanyInfo[];
  overallRiskLevel: RiskLevel;
  summary: string;
}

// 付款节点
export interface PaymentNode {
  id: string;
  node: string;
  proportion: number;
  condition: string;
  timeLimit?: string;
  isCompliant: boolean;
  violations: string[];
}

// 付款节点审查结果
export interface PaymentNodeResult {
  agentType: 'payment-node-agent';
  hasAdvancePayment: boolean;
  completionPaymentProportion: number;
  warrantyProportion: number;
  warrantyPeriod?: string;
  paymentNodes: PaymentNode[];
  violations: RiskPoint[];
  overallRiskLevel: RiskLevel;
  summary: string;
}

// 法律条款
export interface LegalClause {
  id: string;
  contractClauseRef: string;
  citedLaw: string;
  clauseNumber?: string;
  isAccurate: boolean;
  isValid: boolean;
  isApplicable: boolean;
  issues: string[];
  correction?: string;
}

// 法律条款审查结果
export interface LegalClauseResult {
  agentType: 'legal-clause-agent';
  clauses: LegalClause[];
  missingClauses: string[];
  overallRiskLevel: RiskLevel;
  summary: string;
}

// 专业审查Agent结果联合类型
export type SpecialistResult = 
  | SubjectRiskResult 
  | PaymentNodeResult 
  | LegalClauseResult;

// 整改建议
export interface RectificationSuggestion {
  id: string;
  priority: number;
  riskLevel: RiskLevel;
  module: '主体公司风险' | '付款节点' | '法律条款';
  issue: string;
  suggestion: string;
}

// 总结Agent输出
export interface SummaryResult {
  agentType: 'summary-agent';
  overallRiskLevel: RiskLevel;
  shouldSign: boolean;
  subjectRiskSummary: string;
  paymentNodeSummary: string;
  legalClauseSummary: string;
  rectificationSuggestions: RectificationSuggestion[];
  finalAdvice: string;
  fullReport: string;
}

// 完整审查结果
export interface ContractReviewResult {
  contractText: string;
  taskDistribution: TaskDistributionOutput;
  subjectRiskResult?: SubjectRiskResult;
  paymentNodeResult?: PaymentNodeResult;
  legalClauseResult?: LegalClauseResult;
  summaryResult?: SummaryResult;
  timestamp: number;
}

// Agent接口
export interface Agent<TInput, TOutput> {
  type: AgentType;
  name: string;
  description: string;
  process(input: TInput): Promise<TOutput>;
}

// 任务分派输入
export interface TaskDistributionInput {
  contractText: string;
}

// 专业审查Agent输入
export interface SpecialistAgentInput {
  contractText: string;
  taskId: string;
}

// 总结Agent输入
export interface SummaryAgentInput {
  subjectRiskResult: SubjectRiskResult;
  paymentNodeResult: PaymentNodeResult;
  legalClauseResult: LegalClauseResult;
}

// 审查进度
export interface ReviewProgress {
  stage: '任务分派' | '主体风险审查' | '付款节点审查' | '法律条款审查' | '结果汇总' | '完成';
  progress: number;
  message: string;
  results: Partial<ContractReviewResult>;
}
