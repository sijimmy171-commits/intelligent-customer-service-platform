import {
  Agent,
  SummaryAgentInput,
  SummaryResult,
  SubjectRiskResult,
  PaymentNodeResult,
  LegalClauseResult,
  RectificationSuggestion,
  RiskLevel,
} from '@/types/contract-review';

/**
 * 总结Agent - 结果汇总员
 * 
 * 【角色设定】
 * 你是合同审查结果总结专家，具备清晰的逻辑梳理和结果汇总能力，不参与具体审查工作，
 * 仅接收任务分派Agent提交的3个专业审查Agent的结果，进行整合、提炼，形成统一、简洁、全面的最终审查结论。
 * 
 * 【核心职责】
 * 1. 接收3个专业审查Agent的完整审查结果，逐一梳理核心风险点、风险等级和整改建议
 * 2. 整合所有审查内容，按"主体风险、付款节点、法律条款"分类呈现，剔除重复内容，提炼核心问题
 * 3. 给出整体风险评估（高/中/低），明确是否建议签订合同
 * 4. 整理整改建议清单，按风险等级排序
 */
export class SummaryAgent implements Agent<SummaryAgentInput, SummaryResult> {
  type = 'summary-agent' as const;
  name = '总结Agent';
  description = '整合3个专业审查Agent的结果，生成统一、简洁、全面的最终审查结论';

  /**
   * 【工作流程】
   * 接收审查素材 → 梳理3个专业Agent的核心结果 → 分类整合、提炼核心问题 → 生成整体风险评估和整改清单 → 输出最终审查结论
   */
  async process(input: SummaryAgentInput): Promise<SummaryResult> {
    console.log('[SummaryAgent] 开始汇总审查结果...');

    const { subjectRiskResult, paymentNodeResult, legalClauseResult } = input;

    // 计算整体风险等级
    const overallRiskLevel = this.calculateOverallRisk(
      subjectRiskResult,
      paymentNodeResult,
      legalClauseResult
    );

    // 判断是否建议签订合同
    const shouldSign = overallRiskLevel !== '高';

    // 生成各模块总结
    const subjectRiskSummary = this.summarizeSubjectRisk(subjectRiskResult);
    const paymentNodeSummary = this.summarizePaymentNode(paymentNodeResult);
    const legalClauseSummary = this.summarizeLegalClause(legalClauseResult);

    // 生成整改建议清单
    const rectificationSuggestions = this.generateRectificationSuggestions(
      subjectRiskResult,
      paymentNodeResult,
      legalClauseResult
    );

    // 生成最终建议
    const finalAdvice = this.generateFinalAdvice(overallRiskLevel, rectificationSuggestions);

    // 生成完整报告
    const fullReport = this.generateFullReport(
      overallRiskLevel,
      shouldSign,
      subjectRiskResult,
      paymentNodeResult,
      legalClauseResult,
      rectificationSuggestions,
      finalAdvice
    );

    const result: SummaryResult = {
      agentType: 'summary-agent',
      overallRiskLevel,
      shouldSign,
      subjectRiskSummary,
      paymentNodeSummary,
      legalClauseSummary,
      rectificationSuggestions,
      finalAdvice,
      fullReport,
    };

    console.log('[SummaryAgent] 审查结果汇总完成');
    return result;
  }

  /**
   * 计算整体风险等级
   */
  private calculateOverallRisk(
    subjectRiskResult: SubjectRiskResult,
    paymentNodeResult: PaymentNodeResult,
    legalClauseResult: LegalClauseResult
  ): RiskLevel {
    const risks: RiskLevel[] = [
      subjectRiskResult.overallRiskLevel,
      paymentNodeResult.overallRiskLevel,
      legalClauseResult.overallRiskLevel,
    ];

    if (risks.includes('高')) return '高';
    if (risks.filter(r => r === '中').length >= 2) return '中';
    if (risks.includes('中')) return '中';
    return '低';
  }

  /**
   * 总结主体风险
   */
  private summarizeSubjectRisk(result: SubjectRiskResult): string {
    const highRiskCount = result.companies.reduce(
      (sum, c) => sum + c.riskPoints.filter(r => r.riskLevel === '高').length,
      0
    );
    const mediumRiskCount = result.companies.reduce(
      (sum, c) => sum + c.riskPoints.filter(r => r.riskLevel === '中').length,
      0
    );

    let summary = '';
    
    // 核心问题
    const coreIssues: string[] = [];
    for (const company of result.companies) {
      for (const risk of company.riskPoints) {
        if (risk.riskLevel === '高') {
          coreIssues.push(`${company.name}：${risk.description}`);
        }
      }
    }

    if (coreIssues.length > 0) {
      summary += `核心问题：${coreIssues.join('；')}。`;
    }

    // 整改建议
    const suggestions: string[] = [];
    for (const company of result.companies) {
      for (const risk of company.riskPoints) {
        if (risk.riskLevel === '高' || risk.riskLevel === '中') {
          suggestions.push(risk.suggestion);
        }
      }
    }

    if (suggestions.length > 0) {
      summary += `整改建议：${suggestions.slice(0, 3).join('；')}${suggestions.length > 3 ? '等' : ''}。`;
    }

    return summary || '主体风险较低，基本符合签约要求。';
  }

  /**
   * 总结付款节点风险
   */
  private summarizePaymentNode(result: PaymentNodeResult): string {
    let summary = '';

    // 核心问题
    const coreIssues: string[] = [];
    
    if (result.hasAdvancePayment) {
      coreIssues.push('存在预付款条款');
    }
    
    if (result.completionPaymentProportion > 90) {
      coreIssues.push(`工程完成后付款比例${result.completionPaymentProportion}%超标`);
    }
    
    if (result.warrantyProportion < 10) {
      coreIssues.push(`质保金比例${result.warrantyProportion}%不足`);
    }

    if (coreIssues.length > 0) {
      summary += `核心问题：${coreIssues.join('，')}。`;
    }

    // 整改建议
    const suggestions: string[] = [];
    
    if (result.hasAdvancePayment) {
      suggestions.push('删除所有预付款相关条款');
    }
    
    if (result.completionPaymentProportion > 90) {
      suggestions.push(`将工程完成后付款比例调整为不超过90%`);
    }
    
    if (result.warrantyProportion < 10) {
      suggestions.push(`将质保金调整为合同总金额的10%`);
    }

    // 添加质保金支付条件建议
    const hasWarrantyConditionIssue = result.violations.some(
      v => v.id === 'payment-violation-3b' || v.id === 'payment-violation-5'
    );
    if (hasWarrantyConditionIssue) {
      suggestions.push('明确质保期期限（建议1-2年）、质保结算流程，约定质保期届满无质量问题后全额支付');
    }

    if (suggestions.length > 0) {
      summary += `整改建议：${suggestions.join('；')}。`;
    }

    return summary || '付款条款基本合规。';
  }

  /**
   * 总结法律条款风险
   */
  private summarizeLegalClause(result: LegalClauseResult): string {
    let summary = '';

    // 核心问题
    const coreIssues: string[] = [];
    
    const invalidClauses = result.clauses.filter(c => !c.isValid);
    if (invalidClauses.length > 0) {
      coreIssues.push(`引用已废止法律${invalidClauses.length}处`);
    }
    
    const inaccurateClauses = result.clauses.filter(c => !c.isAccurate);
    if (inaccurateClauses.length > 0) {
      coreIssues.push(`条款编号错误${inaccurateClauses.length}处`);
    }

    if (coreIssues.length > 0) {
      summary += `核心问题：${coreIssues.join('，')}。`;
    }

    // 整改建议
    const suggestions: string[] = [];
    
    if (invalidClauses.length > 0) {
      suggestions.push('将《中华人民共和国合同法》等相关引用替换为《中华人民共和国民法典》对应正确条款');
    }
    
    if (inaccurateClauses.length > 0) {
      suggestions.push('修正法律条款编号错误，确保引用准确');
    }
    
    if (result.missingClauses.length > 0) {
      suggestions.push(`补充${result.missingClauses.length}类必要法律条款引用`);
    }

    if (suggestions.length > 0) {
      summary += `整改建议：${suggestions.join('；')}。`;
    }

    return summary || '法律条款引用基本规范。';
  }

  /**
   * 生成整改建议清单
   */
  private generateRectificationSuggestions(
    subjectRiskResult: SubjectRiskResult,
    paymentNodeResult: PaymentNodeResult,
    legalClauseResult: LegalClauseResult
  ): RectificationSuggestion[] {
    const suggestions: RectificationSuggestion[] = [];
    let priority = 1;

    // 主体风险整改建议（高优先级）
    for (const company of subjectRiskResult.companies) {
      for (const risk of company.riskPoints) {
        if (risk.riskLevel === '高') {
          suggestions.push({
            id: `rect-${priority}`,
            priority: priority++,
            riskLevel: '高',
            module: '主体公司风险',
            issue: risk.description,
            suggestion: risk.suggestion,
          });
        }
      }
    }

    // 付款节点整改建议（高优先级）
    for (const violation of paymentNodeResult.violations) {
      if (violation.riskLevel === '高') {
        suggestions.push({
          id: `rect-${priority}`,
          priority: priority++,
          riskLevel: '高',
          module: '付款节点',
          issue: violation.description,
          suggestion: violation.suggestion,
        });
      }
    }

    // 法律条款整改建议（高优先级）
    for (const clause of legalClauseResult.clauses) {
      if (!clause.isValid) {
        suggestions.push({
          id: `rect-${priority}`,
          priority: priority++,
          riskLevel: '高',
          module: '法律条款',
          issue: `引用已废止法律：${clause.citedLaw}`,
          suggestion: clause.correction || '替换为现行有效法律条款',
        });
      }
    }

    // 中优先级建议
    for (const company of subjectRiskResult.companies) {
      for (const risk of company.riskPoints) {
        if (risk.riskLevel === '中') {
          suggestions.push({
            id: `rect-${priority}`,
            priority: priority++,
            riskLevel: '中',
            module: '主体公司风险',
            issue: risk.description,
            suggestion: risk.suggestion,
          });
        }
      }
    }

    for (const violation of paymentNodeResult.violations) {
      if (violation.riskLevel === '中') {
        suggestions.push({
          id: `rect-${priority}`,
          priority: priority++,
          riskLevel: '中',
          module: '付款节点',
          issue: violation.description,
          suggestion: violation.suggestion,
        });
      }
    }

    for (const clause of legalClauseResult.clauses) {
      if (!clause.isAccurate && clause.isValid) {
        suggestions.push({
          id: `rect-${priority}`,
          priority: priority++,
          riskLevel: '中',
          module: '法律条款',
          issue: `条款编号错误：${clause.citedLaw}`,
          suggestion: clause.correction || '修正条款编号',
        });
      }
    }

    // 缺失的必要条款
    for (const missing of legalClauseResult.missingClauses) {
      suggestions.push({
        id: `rect-${priority}`,
        priority: priority++,
        riskLevel: '中',
        module: '法律条款',
        issue: `缺失必要条款：${missing}`,
        suggestion: `补充${missing.split('：')[0]}相关法律条款引用`,
      });
    }

    // 低优先级建议
    for (const violation of paymentNodeResult.violations) {
      if (violation.riskLevel === '低') {
        suggestions.push({
          id: `rect-${priority}`,
          priority: priority++,
          riskLevel: '低',
          module: '付款节点',
          issue: violation.description,
          suggestion: violation.suggestion,
        });
      }
    }

    return suggestions;
  }

  /**
   * 生成最终建议
   */
  private generateFinalAdvice(
    overallRiskLevel: RiskLevel,
    suggestions: RectificationSuggestion[]
  ): string {
    const highRiskCount = suggestions.filter(s => s.riskLevel === '高').length;
    const mediumRiskCount = suggestions.filter(s => s.riskLevel === '中').length;

    if (overallRiskLevel === '高') {
      return `暂不签订合同。存在${highRiskCount}项高风险问题，需按整改建议完成所有调整后，重新提交审查，确认无风险后再签订。`;
    } else if (overallRiskLevel === '中') {
      return `谨慎签订合同。存在${mediumRiskCount}项中风险问题，建议先完成整改建议中的高风险和中风险项，再推进合同签订。`;
    } else {
      return `可以签订合同。合同风险较低，建议按整改建议补充完善低风险项后即可签订。`;
    }
  }

  /**
   * 生成完整报告
   */
  private generateFullReport(
    overallRiskLevel: RiskLevel,
    shouldSign: boolean,
    subjectRiskResult: SubjectRiskResult,
    paymentNodeResult: PaymentNodeResult,
    legalClauseResult: LegalClauseResult,
    suggestions: RectificationSuggestion[],
    finalAdvice: string
  ): string {
    const highRiskCount = suggestions.filter(s => s.riskLevel === '高').length;
    const mediumRiskCount = suggestions.filter(s => s.riskLevel === '中').length;
    const lowRiskCount = suggestions.filter(s => s.riskLevel === '低').length;

    let report = `【AI合同审查助手最终结论】\n\n`;

    // 一、整体风险评估
    report += `一、整体风险评估：${overallRiskLevel}风险`;
    if (highRiskCount > 0 || mediumRiskCount > 0 || lowRiskCount > 0) {
      report += `（存在`;
      if (highRiskCount > 0) report += `${highRiskCount}项高风险、`;
      if (mediumRiskCount > 0) report += `${mediumRiskCount}项中风险、`;
      if (lowRiskCount > 0) report += `${lowRiskCount}项低风险、`;
      report = report.replace(/、$/, '');
      report += `）`;
    }
    report += `\n\n`;

    // 二、分模块审查结果
    report += `二、分模块审查结果\n\n`;
    
    report += `1. 主体公司风险（来自subject-risk-agent）\n`;
    report += `${this.summarizeSubjectRisk(subjectRiskResult)}\n\n`;
    
    report += `2. 付款节点风险（来自payment-node-agent）\n`;
    report += `${this.summarizePaymentNode(paymentNodeResult)}\n\n`;
    
    report += `3. 法律条款风险（来自legal-clause-agent）\n`;
    report += `${this.summarizeLegalClause(legalClauseResult)}\n\n`;

    // 三、整改优先级
    report += `三、整改优先级\n`;
    
    const highRiskItems = suggestions.filter(s => s.riskLevel === '高');
    const mediumRiskItems = suggestions.filter(s => s.riskLevel === '中');
    const lowRiskItems = suggestions.filter(s => s.riskLevel === '低');

    if (highRiskItems.length > 0) {
      report += `1. 高风险项（立即整改）：\n`;
      highRiskItems.slice(0, 3).forEach((item, idx) => {
        report += `   ${idx + 1}. ${item.issue}\n`;
      });
      report += `\n`;
    }

    if (mediumRiskItems.length > 0) {
      report += `2. 中风险项（限期整改）：\n`;
      mediumRiskItems.slice(0, 3).forEach((item, idx) => {
        report += `   ${idx + 1}. ${item.issue}\n`;
      });
      report += `\n`;
    }

    if (lowRiskItems.length > 0) {
      report += `3. 低风险项（补充完善）：\n`;
      lowRiskItems.slice(0, 2).forEach((item, idx) => {
        report += `   ${idx + 1}. ${item.issue}\n`;
      });
      report += `\n`;
    }

    // 四、最终建议
    report += `四、最终建议\n`;
    report += `${finalAdvice}\n`;

    return report;
  }
}

// 导出单例实例
export const summaryAgent = new SummaryAgent();
