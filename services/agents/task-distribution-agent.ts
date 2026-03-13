import {
  Agent,
  TaskDistributionInput,
  TaskDistributionOutput,
} from '@/types/contract-review';

/**
 * 任务分派Agent - 核心指挥官
 * 
 * 【角色设定】
 * 你是AI合同审查助手的总任务分派指挥官，具备高效的任务拆解、Agent调度和结果汇总能力，
 * 精通合同审查全流程，严格遵循多Agent协作逻辑，仅负责任务分派与结果中转，不参与具体审查工作。
 * 
 * 【核心职责】
 * 1. 接收用户上传的合同文本，快速拆解出3项核心审查任务
 * 2. 将拆解后的任务及完整合同文本，精准分派给对应的专业审查Agent
 * 3. 实时接收3个专业审查Agent的审查结果，核对结果完整性
 * 4. 待所有专业审查结果齐全后，将完整审查素材统一提交给总结Agent
 */
export class TaskDistributionAgent implements Agent<TaskDistributionInput, TaskDistributionOutput> {
  type = 'task-distribution-agent' as const;
  name = '任务分派Agent';
  description = '负责拆解合同审查任务并分派给各专业审查Agent，接收结果后提交给总结Agent';

  // 跟踪各Agent的完成状态
  private completionStatus = {
    主体风险审查: false,
    付款节点审查: false,
    法律条款审查: false,
  };

  /**
   * 处理任务分派
   * 【工作流程】
   * 接收合同文本 → 拆解3项审查任务 → 分派任务给对应专业Agent
   */
  async process(input: TaskDistributionInput): Promise<TaskDistributionOutput> {
    console.log('[TaskDistributionAgent] 开始任务分派...');
    console.log(`[TaskDistributionAgent] 合同文本长度: ${input.contractText.length} 字符`);

    // 验证合同文本
    if (!input.contractText || input.contractText.trim().length === 0) {
      throw new Error('合同文本不能为空');
    }

    // 分析合同文本，提取关键信息用于任务分派
    const contractAnalysis = this.analyzeContract(input.contractText);
    console.log('[TaskDistributionAgent] 合同分析完成:', contractAnalysis);

    // 生成任务分派结果
    const output: TaskDistributionOutput = {
      status: '任务分派完成',
      task_distribution: {
        主体风险审查: '已分派至subject-risk-agent',
        付款节点审查: '已分派至payment-node-agent',
        法律条款审查: '已分派至legal-clause-agent',
      },
      received_results: {
        主体风险审查: false,
        付款节点审查: false,
        法律条款审查: false,
      },
      next_step: '等待补充结果',
    };

    console.log('[TaskDistributionAgent] 任务分派完成');
    return output;
  }

  /**
   * 分析合同文本，提取关键信息
   */
  private analyzeContract(contractText: string): {
    hasPartyA: boolean;
    hasPartyB: boolean;
    hasPaymentTerms: boolean;
    hasLegalClauses: boolean;
    contractType: string;
  } {
    const text = contractText.toLowerCase();
    
    // 检测合同双方
    const hasPartyA = /甲方|委托方|发包方|业主/.test(contractText);
    const hasPartyB = /乙方|受托方|承包方|施工方/.test(contractText);
    
    // 检测付款条款
    const hasPaymentTerms = /付款|支付|预付款|进度款|结算|质保金/.test(contractText);
    
    // 检测法律条款引用
    const hasLegalClauses = /《.*法》|第.*条|民法典|合同法|建筑法/.test(contractText);
    
    // 判断合同类型
    let contractType = '一般合同';
    if (/建设工程|施工|工程|项目/.test(contractText)) {
      contractType = '建设工程合同';
    } else if (/买卖|采购|供货/.test(contractText)) {
      contractType = '买卖合同';
    } else if (/服务|咨询|顾问/.test(contractText)) {
      contractType = '服务合同';
    } else if (/租赁|房租|设备/.test(contractText)) {
      contractType = '租赁合同';
    }

    return {
      hasPartyA,
      hasPartyB,
      hasPaymentTerms,
      hasLegalClauses,
      contractType,
    };
  }

  /**
   * 接收专业Agent的审查结果
   * 【约束条件】若某专业Agent未在规定时间内反馈，重复提醒1次
   */
  receiveResult(agentType: 'subject-risk-agent' | 'payment-node-agent' | 'legal-clause-agent'): void {
    const mapping: Record<typeof agentType, keyof typeof this.completionStatus> = {
      'subject-risk-agent': '主体风险审查',
      'payment-node-agent': '付款节点审查',
      'legal-clause-agent': '法律条款审查',
    };

    const taskName = mapping[agentType];
    this.completionStatus[taskName] = true;
    console.log(`[TaskDistributionAgent] 收到 ${taskName} 结果`);
  }

  /**
   * 检查是否所有专业Agent都已完成
   */
  areAllResultsReceived(): boolean {
    return Object.values(this.completionStatus).every(status => status);
  }

  /**
   * 获取当前结果接收状态
   */
  getCompletionStatus(): typeof this.completionStatus {
    return { ...this.completionStatus };
  }

  /**
   * 重置完成状态（用于新的审查任务）
   */
  reset(): void {
    this.completionStatus = {
      主体风险审查: false,
      付款节点审查: false,
      法律条款审查: false,
    };
  }
}

// 导出单例实例
export const taskDistributionAgent = new TaskDistributionAgent();
