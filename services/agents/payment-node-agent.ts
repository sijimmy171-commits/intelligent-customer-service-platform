import {
  Agent,
  SpecialistAgentInput,
  PaymentNodeResult,
  PaymentNode,
  RiskPoint,
  RiskLevel,
} from '@/types/contract-review';

/**
 * 付款节点审查Agent - 专业审查员
 * 
 * 【角色设定】
 * 你是合同付款节点审查专家，精通工程类合同付款相关规范和行业惯例，严格遵循用户指定的付款规则，
 * 专注于合同中付款节点、付款比例、付款条件的审查，不涉及其他审查内容。
 * 
 * 【核心审查规则】（优先级最高，必须严格执行）
 * ① 禁止任何形式的预付款（无论以"预付款""定金""启动资金"等任何名义，均视为违规）
 * ② 工程全部完成并通过竣工验收合格后，付款比例不得超过合同总金额的90%
 * ③ 剩余10%作为质保金，需在工程质保期届满、完成质保结算且无质量问题后，方可全额支付
 * ④ 额外审查：付款节点是否明确、付款时限是否清晰、是否约定逾期付款责任
 */
export class PaymentNodeAgent implements Agent<SpecialistAgentInput, PaymentNodeResult> {
  type = 'payment-node-agent' as const;
  name = '付款节点审查Agent';
  description = '严格按照付款规则审查合同中的付款节点、比例、条件，识别违规付款条款';

  // 核心审查规则常量
  private readonly RULES = {
    NO_ADVANCE_PAYMENT: true,
    MAX_COMPLETION_PAYMENT: 90,
    WARRANTY_RESERVE: 10,
    WARRANTY_PAYMENT_CONDITION: '质保期届满、完成质保结算且无质量问题',
  };

  /**
   * 【工作流程】
   * 接收任务指令及合同文本 → 定位所有付款相关条款 → 对照核心规则排查违规 → 生成标准化审查结果
   */
  async process(input: SpecialistAgentInput): Promise<PaymentNodeResult> {
    console.log('[PaymentNodeAgent] 开始付款节点审查...');

    const contractText = input.contractText;
    
    // 提取付款节点
    const paymentNodes = this.extractPaymentNodes(contractText);
    console.log(`[PaymentNodeAgent] 识别到${paymentNodes.length}个付款节点`);

    // 检查核心规则
    const hasAdvancePayment = this.checkAdvancePayment(contractText, paymentNodes);
    const completionPaymentProportion = this.calculateCompletionPayment(paymentNodes);
    const warrantyInfo = this.checkWarrantyPayment(paymentNodes);

    // 生成违规点
    const violations = this.generateViolations(
      contractText,
      paymentNodes,
      hasAdvancePayment,
      completionPaymentProportion,
      warrantyInfo
    );

    // 计算整体风险等级
    const overallRiskLevel = this.calculateOverallRisk(violations);

    // 生成总结
    const summary = this.generateSummary(
      hasAdvancePayment,
      completionPaymentProportion,
      warrantyInfo,
      violations,
      overallRiskLevel
    );

    const result: PaymentNodeResult = {
      agentType: 'payment-node-agent',
      hasAdvancePayment,
      completionPaymentProportion,
      warrantyProportion: warrantyInfo.proportion,
      warrantyPeriod: warrantyInfo.period,
      paymentNodes,
      violations,
      overallRiskLevel,
      summary,
    };

    console.log('[PaymentNodeAgent] 付款节点审查完成');
    return result;
  }

  /**
   * 从合同文本中提取付款节点
   */
  private extractPaymentNodes(contractText: string): PaymentNode[] {
    const nodes: PaymentNode[] = [];
    const lines = contractText.split(/[。；\n]/);

    let nodeIndex = 0;
    for (const line of lines) {
      // 匹配付款相关条款
      const paymentPatterns = [
        /(预付款|定金|启动资金|首付款).*?(\d+)%/,
        /(进度款|阶段付款|节点付款).*?(\d+)%/,
        /(验收.*付款|竣工.*付款|完成.*付款).*?(\d+)%/,
        /(质保金|保修金|保证金).*?(\d+)%/,
        /(结算款|尾款).*?(\d+)%/,
      ];

      for (const pattern of paymentPatterns) {
        const match = line.match(pattern);
        if (match) {
          const nodeName = match[1];
          const proportion = parseInt(match[2], 10);
          
          // 提取付款条件
          const condition = this.extractPaymentCondition(line);
          
          // 提取付款时限
          const timeLimit = this.extractTimeLimit(line);

          nodes.push({
            id: `payment-${nodeIndex++}`,
            node: nodeName,
            proportion,
            condition,
            timeLimit,
            isCompliant: true, // 先标记为合规，后续检查时再修正
            violations: [],
          });
          break;
        }
      }
    }

    // 如果没有匹配到具体节点，尝试整体分析
    if (nodes.length === 0) {
      // 检查是否有付款相关描述
      if (/付款|支付/.test(contractText)) {
        // 尝试提取付款比例
        const proportionMatches = contractText.match(/(\d+)%/g);
        if (proportionMatches) {
          proportionMatches.forEach((prop, idx) => {
            const proportion = parseInt(prop.replace('%', ''), 10);
            nodes.push({
              id: `payment-${idx}`,
              node: `付款节点${idx + 1}`,
              proportion,
              condition: '合同约定的付款条件',
              isCompliant: true,
              violations: [],
            });
          });
        }
      }
    }

    return nodes;
  }

  /**
   * 提取付款条件
   */
  private extractPaymentCondition(line: string): string {
    const conditionPatterns = [
      /(验收合格|竣工验收|工程完成|交付使用).*?后/,
      /(合同签订|协议签署).*?后/,
      /(材料进场|人员进场|开工).*?后/,
      /质保期.*?(届满|结束|期满)/,
    ];

    for (const pattern of conditionPatterns) {
      const match = line.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return '按合同约定';
  }

  /**
   * 提取付款时限
   */
  private extractTimeLimit(line: string): string | undefined {
    const timePatterns = [
      /(\d+)日内/,
      /(\d+)个工作日内/,
      /(\d+)天内/,
      /(收到.*后|验收合格后).*?(\d+)日/,
    ];

    for (const pattern of timePatterns) {
      const match = line.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return undefined;
  }

  /**
   * 检查是否存在预付款
   * 【核心规则①】禁止任何形式的预付款
   */
  private checkAdvancePayment(contractText: string, nodes: PaymentNode[]): boolean {
    // 检查付款节点名称
    const advancePatterns = /预付款|定金|订金|启动资金|首付款|备料款/;
    
    // 检查节点
    for (const node of nodes) {
      if (advancePatterns.test(node.node)) {
        node.isCompliant = false;
        node.violations.push('存在预付款，违反核心规则①');
        return true;
      }
    }

    // 检查合同文本
    if (advancePatterns.test(contractText)) {
      return true;
    }

    return false;
  }

  /**
   * 计算工程完成后的付款比例
   * 【核心规则②】工程完成后付款比例不得超过90%
   */
  private calculateCompletionPayment(nodes: PaymentNode[]): number {
    let completionPayment = 0;

    for (const node of nodes) {
      // 判断是否为工程完成后的付款
      const isCompletionPayment = 
        /验收|竣工|完成|交付|结算/.test(node.condition) ||
        /验收|竣工|完成|交付|结算/.test(node.node);

      if (isCompletionPayment) {
        completionPayment += node.proportion;
      }
    }

    return completionPayment;
  }

  /**
   * 检查质保金条款
   * 【核心规则③】质保金应为10%，在质保结算后支付
   */
  private checkWarrantyPayment(nodes: PaymentNode[]): { proportion: number; period?: string; isCompliant: boolean } {
    let warrantyProportion = 0;
    let warrantyPeriod: string | undefined;
    let isCompliant = true;

    for (const node of nodes) {
      if (/质保金|保修金|保证金/.test(node.node)) {
        warrantyProportion = node.proportion;

        // 检查质保期
        const periodMatch = node.condition.match(/(\d+)年|(\d+)个月/);
        if (periodMatch) {
          warrantyPeriod = periodMatch[0];
        }

        // 检查质保金比例
        if (node.proportion < this.RULES.WARRANTY_RESERVE) {
          node.isCompliant = false;
          node.violations.push(`质保金比例为${node.proportion}%，低于要求的${this.RULES.WARRANTY_RESERVE}%`);
          isCompliant = false;
        }

        // 检查支付条件
        const hasCorrectCondition = /质保期.*?(届满|结束|期满)|质保结算|无质量问题/.test(node.condition);
        if (!hasCorrectCondition) {
          node.isCompliant = false;
          node.violations.push('质保金支付条件不符合要求');
          isCompliant = false;
        }
      }
    }

    return { proportion: warrantyProportion, period: warrantyPeriod, isCompliant };
  }

  /**
   * 生成违规点列表
   */
  private generateViolations(
    contractText: string,
    nodes: PaymentNode[],
    hasAdvancePayment: boolean,
    completionPaymentProportion: number,
    warrantyInfo: { proportion: number; period?: string; isCompliant: boolean }
  ): RiskPoint[] {
    const violations: RiskPoint[] = [];

    // 违规①：存在预付款
    if (hasAdvancePayment) {
      violations.push({
        id: 'payment-violation-1',
        description: '合同存在预付款条款（预付款/定金/启动资金等），违反核心规则①',
        riskLevel: '高',
        contractClause: '付款条款',
        suggestion: '删除所有预付款相关条款，禁止任何名义的预付款支付',
      });
    }

    // 违规②：工程完成后付款比例超标
    if (completionPaymentProportion > this.RULES.MAX_COMPLETION_PAYMENT) {
      violations.push({
        id: 'payment-violation-2',
        description: `工程完成后付款比例为${completionPaymentProportion}%，超过最高限额${this.RULES.MAX_COMPLETION_PAYMENT}%`,
        riskLevel: '高',
        contractClause: '付款节点条款',
        suggestion: `将工程完成后付款比例调整为不超过${this.RULES.MAX_COMPLETION_PAYMENT}%，明确验收合格的判定标准`,
      });
    }

    // 违规③：质保金条款不合规
    if (warrantyInfo.proportion > 0 && !warrantyInfo.isCompliant) {
      if (warrantyInfo.proportion < this.RULES.WARRANTY_RESERVE) {
        violations.push({
          id: 'payment-violation-3a',
          description: `质保金比例为${warrantyInfo.proportion}%，低于要求的${this.RULES.WARRANTY_RESERVE}%`,
          riskLevel: '中',
          contractClause: '质保金条款',
          suggestion: `将质保金调整为合同总金额的${this.RULES.WARRANTY_RESERVE}%`,
        });
      }
    }

    // 检查质保金支付条件
    const hasWarrantySettlement = /质保结算|质保期满.*支付|质保期届满.*支付/.test(contractText);
    if (warrantyInfo.proportion > 0 && !hasWarrantySettlement) {
      violations.push({
        id: 'payment-violation-3b',
        description: '质保金支付条件未明确约定质保结算要求',
        riskLevel: '中',
        contractClause: '质保金条款',
        suggestion: '明确质保期期限（建议1-2年）、质保结算流程，约定质保期届满无质量问题后全额支付',
      });
    }

    // 检查付款时限
    const hasVagueTimeLimit = /尽快支付|审核后支付|验收后支付|适时支付/.test(contractText);
    if (hasVagueTimeLimit) {
      violations.push({
        id: 'payment-violation-4',
        description: '付款时限存在模糊表述',
        riskLevel: '低',
        contractClause: '付款时限条款',
        suggestion: '补充具体的付款时限（如"验收合格后14日内"）及逾期付款责任',
      });
    }

    // 检查质保期期限
    if (warrantyInfo.proportion > 0 && !warrantyInfo.period) {
      violations.push({
        id: 'payment-violation-5',
        description: '质保金条款未明确质保期期限',
        riskLevel: '中',
        contractClause: '质保金条款',
        suggestion: '明确质保期期限，建议建设工程质保期为1-2年',
      });
    }

    return violations;
  }

  /**
   * 计算整体风险等级
   */
  private calculateOverallRisk(violations: RiskPoint[]): RiskLevel {
    const highRiskCount = violations.filter(v => v.riskLevel === '高').length;
    const mediumRiskCount = violations.filter(v => v.riskLevel === '中').length;

    if (highRiskCount > 0) return '高';
    if (mediumRiskCount > 1) return '中';
    return '低';
  }

  /**
   * 生成审查总结
   */
  private generateSummary(
    hasAdvancePayment: boolean,
    completionPaymentProportion: number,
    warrantyInfo: { proportion: number; period?: string; isCompliant: boolean },
    violations: RiskPoint[],
    overallRiskLevel: RiskLevel
  ): string {
    const highRiskCount = violations.filter(v => v.riskLevel === '高').length;
    const mediumRiskCount = violations.filter(v => v.riskLevel === '中').length;
    const lowRiskCount = violations.filter(v => v.riskLevel === '低').length;

    let summary = '';

    // 核心规则检查结果
    if (hasAdvancePayment) {
      summary += '违反规则①：存在预付款；';
    } else {
      summary += '符合规则①：无预付款；';
    }

    if (completionPaymentProportion > this.RULES.MAX_COMPLETION_PAYMENT) {
      summary += `违反规则②：工程完成后付款${completionPaymentProportion}%超标；`;
    } else {
      summary += `符合规则②：工程完成后付款${completionPaymentProportion}%未超标；`;
    }

    if (warrantyInfo.proportion >= this.RULES.WARRANTY_RESERVE && warrantyInfo.isCompliant) {
      summary += '符合规则③：质保金条款合规。';
    } else {
      summary += '违反规则③：质保金条款不合规。';
    }

    summary += `共发现`;
    if (highRiskCount > 0) summary += `高风险${highRiskCount}项、`;
    if (mediumRiskCount > 0) summary += `中风险${mediumRiskCount}项、`;
    if (lowRiskCount > 0) summary += `低风险${lowRiskCount}项、`;
    summary = summary.replace(/、$/, '。');

    if (overallRiskLevel === '高') {
      summary += '付款条款违规情况较严重，需全面整改后方可确保付款合规。';
    } else if (overallRiskLevel === '中') {
      summary += '付款条款存在一定问题，建议按整改建议进行调整。';
    } else {
      summary += '付款条款基本合规，建议继续保持。';
    }

    return summary;
  }
}

// 导出单例实例
export const paymentNodeAgent = new PaymentNodeAgent();
