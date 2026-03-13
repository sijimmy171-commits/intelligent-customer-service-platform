import {
  ContractReviewResult,
  ReviewProgress,
  TaskDistributionInput,
  SpecialistAgentInput,
  SummaryAgentInput,
} from '@/types/contract-review';
import {
  taskDistributionAgent,
  subjectRiskAgent,
  paymentNodeAgent,
  legalClauseAgent,
  summaryAgent,
} from './agents';

/**
 * 合同审查编排器
 * 
 * 负责协调多个Agent的执行流程：
 * 1. 任务分派Agent → 拆解任务
 * 2. 并行执行3个专业审查Agent
 * 3. 总结Agent → 汇总结果
 * 
 * 【Agent调用关系】
 * 仅任务分派Agent可调用3个专业审查Agent，仅任务分派Agent可向总结Agent提交素材，
 * 总结Agent仅向用户输出结果，禁止其他Agent间跨级调用，遵循"任务分派→专业审查→结果汇总"的单向流程
 */
export class ContractReviewOrchestrator {
  private progressCallback?: (progress: ReviewProgress) => void;

  /**
   * 设置进度回调
   */
  onProgress(callback: (progress: ReviewProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * 执行完整的合同审查流程
   */
  async reviewContract(contractText: string): Promise<ContractReviewResult> {
    const timestamp = Date.now();
    
    // 阶段1: 任务分派
    this.updateProgress({
      stage: '任务分派',
      progress: 10,
      message: '正在分析合同并分派审查任务...',
      results: {},
    });

    const taskInput: TaskDistributionInput = { contractText };
    const taskDistribution = await taskDistributionAgent.process(taskInput);

    this.updateProgress({
      stage: '任务分派',
      progress: 20,
      message: '任务分派完成，启动专业审查...',
      results: { contractText, taskDistribution },
    });

    // 阶段2: 并行执行3个专业审查Agent
    const specialistInput: SpecialistAgentInput = {
      contractText,
      taskId: `task-${timestamp}`,
    };

    // 并行执行三个专业审查
    const [subjectRiskResult, paymentNodeResult, legalClauseResult] = await Promise.all([
      this.executeSubjectRiskReview(specialistInput),
      this.executePaymentNodeReview(specialistInput),
      this.executeLegalClauseReview(specialistInput),
    ]);

    // 通知任务分派Agent接收结果
    taskDistributionAgent.receiveResult('subject-risk-agent');
    taskDistributionAgent.receiveResult('payment-node-agent');
    taskDistributionAgent.receiveResult('legal-clause-agent');

    this.updateProgress({
      stage: '结果汇总',
      progress: 80,
      message: '专业审查完成，正在汇总结果...',
      results: {
        contractText,
        taskDistribution,
        subjectRiskResult,
        paymentNodeResult,
        legalClauseResult,
      },
    });

    // 阶段3: 总结Agent汇总结果
    const summaryInput: SummaryAgentInput = {
      subjectRiskResult,
      paymentNodeResult,
      legalClauseResult,
    };

    const summaryResult = await summaryAgent.process(summaryInput);

    this.updateProgress({
      stage: '完成',
      progress: 100,
      message: '审查完成！',
      results: {
        contractText,
        taskDistribution,
        subjectRiskResult,
        paymentNodeResult,
        legalClauseResult,
        summaryResult,
      },
    });

    return {
      contractText,
      taskDistribution,
      subjectRiskResult,
      paymentNodeResult,
      legalClauseResult,
      summaryResult,
      timestamp,
    };
  }

  /**
   * 执行主体风险审查
   */
  private async executeSubjectRiskReview(input: SpecialistAgentInput) {
    this.updateProgress({
      stage: '主体风险审查',
      progress: 30,
      message: '正在审查主体公司风险...',
      results: {},
    });

    const result = await subjectRiskAgent.process(input);

    this.updateProgress({
      stage: '主体风险审查',
      progress: 45,
      message: `主体风险审查完成，风险等级：${result.overallRiskLevel}`,
      results: { subjectRiskResult: result },
    });

    return result;
  }

  /**
   * 执行付款节点审查
   */
  private async executePaymentNodeReview(input: SpecialistAgentInput) {
    this.updateProgress({
      stage: '付款节点审查',
      progress: 35,
      message: '正在审查付款节点...',
      results: {},
    });

    const result = await paymentNodeAgent.process(input);

    this.updateProgress({
      stage: '付款节点审查',
      progress: 50,
      message: `付款节点审查完成，风险等级：${result.overallRiskLevel}`,
      results: { paymentNodeResult: result },
    });

    return result;
  }

  /**
   * 执行法律条款审查
   */
  private async executeLegalClauseReview(input: SpecialistAgentInput) {
    this.updateProgress({
      stage: '法律条款审查',
      progress: 40,
      message: '正在审查法律条款...',
      results: {},
    });

    const result = await legalClauseAgent.process(input);

    this.updateProgress({
      stage: '法律条款审查',
      progress: 55,
      message: `法律条款审查完成，风险等级：${result.overallRiskLevel}`,
      results: { legalClauseResult: result },
    });

    return result;
  }

  /**
   * 更新进度
   */
  private updateProgress(progress: ReviewProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }
}

// 导出单例实例
export const contractReviewOrchestrator = new ContractReviewOrchestrator();

// 便捷函数：执行合同审查
export async function reviewContract(
  contractText: string,
  onProgress?: (progress: ReviewProgress) => void
): Promise<ContractReviewResult> {
  const orchestrator = new ContractReviewOrchestrator();
  if (onProgress) {
    orchestrator.onProgress(onProgress);
  }
  return orchestrator.reviewContract(contractText);
}
