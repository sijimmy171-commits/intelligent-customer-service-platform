import {
  Agent,
  SpecialistAgentInput,
  LegalClauseResult,
  LegalClause,
  RiskPoint,
  RiskLevel,
} from '@/types/contract-review';

/**
 * 法律条款审查Agent - 专业审查员
 * 
 * 【角色设定】
 * 你是合同法律条款审查专家，精通民商法、合同法及相关司法解释，熟悉合同审查操作指引，
 * 专注于合同中引用的所有法律条款的准确性、时效性和适用性审查，不涉及其他审查内容。
 * 
 * 【核心职责】
 * 1. 全面排查合同中所有引用的法律条款
 * 2. 审查引用的法律条款是否准确（无编号错误、无内容篡改、无断章取义）
 * 3. 审查引用的法律条款是否有效（未失效、未废止，符合最新司法解释）
 * 4. 审查引用的法律条款是否适配合同内容
 * 5. 若合同未引用必要的法律条款，提醒补充
 */
export class LegalClauseAgent implements Agent<SpecialistAgentInput, LegalClauseResult> {
  type = 'legal-clause-agent' as const;
  name = '法律条款审查Agent';
  description = '审查合同中引用法律条款的准确性、时效性和适用性，识别法律条款引用错误';

  // 已废止法律列表
  private readonly ABOLISHED_LAWS = [
    { name: '中华人民共和国合同法', replacedBy: '中华人民共和国民法典', effectiveDate: '2021年1月1日' },
    { name: '中华人民共和国担保法', replacedBy: '中华人民共和国民法典', effectiveDate: '2021年1月1日' },
    { name: '中华人民共和国物权法', replacedBy: '中华人民共和国民法典', effectiveDate: '2021年1月1日' },
    { name: '中华人民共和国侵权责任法', replacedBy: '中华人民共和国民法典', effectiveDate: '2021年1月1日' },
    { name: '中华人民共和国民法通则', replacedBy: '中华人民共和国民法典', effectiveDate: '2021年1月1日' },
    { name: '中华人民共和国婚姻法', replacedBy: '中华人民共和国民法典', effectiveDate: '2021年1月1日' },
    { name: '中华人民共和国继承法', replacedBy: '中华人民共和国民法典', effectiveDate: '2021年1月1日' },
    { name: '中华人民共和国收养法', replacedBy: '中华人民共和国民法典', effectiveDate: '2021年1月1日' },
  ];

  // 必要法律条款（建设工程合同）
  private readonly NECESSARY_CLAUSES = [
    { category: '工程质量', description: '工程质量相关法律条款' },
    { category: '违约责任', description: '违约责任相关法律条款' },
    { category: '争议解决', description: '争议解决方式相关法律条款' },
    { category: '合同效力', description: '合同效力相关法律条款' },
  ];

  /**
   * 【工作流程】
   * 接收任务指令及合同文本 → 定位所有引用法律条款 → 核查准确性、时效性、适用性 → 生成标准化审查结果
   */
  async process(input: SpecialistAgentInput): Promise<LegalClauseResult> {
    console.log('[LegalClauseAgent] 开始法律条款审查...');

    const contractText = input.contractText;
    
    // 提取引用的法律条款
    const clauses = this.extractLegalClauses(contractText);
    console.log(`[LegalClauseAgent] 识别到${clauses.length}个法律条款引用`);

    // 检查缺失的必要条款
    const missingClauses = this.checkMissingClauses(contractText);

    // 计算整体风险等级
    const overallRiskLevel = this.calculateOverallRisk(clauses, missingClauses);

    // 生成总结
    const summary = this.generateSummary(clauses, missingClauses, overallRiskLevel);

    const result: LegalClauseResult = {
      agentType: 'legal-clause-agent',
      clauses,
      missingClauses,
      overallRiskLevel,
      summary,
    };

    console.log('[LegalClauseAgent] 法律条款审查完成');
    return result;
  }

  /**
   * 从合同文本中提取法律条款引用
   */
  private extractLegalClauses(contractText: string): LegalClause[] {
    const clauses: LegalClause[] = [];
    const lines = contractText.split(/[。；\n]/);

    let clauseIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 匹配法律条款引用模式
      const lawPatterns = [
        /(《[^》]+法》)[第]*([\d\-]+)*条/,
        /(《中华人民共和国民法典》)[第]*([\d\-]+)*条/,
        /(《中华人民共和国合同法》)[第]*([\d\-]+)*条/,
        /(《中华人民共和国建筑法》)[第]*([\d\-]+)*条/,
        /(《中华人民共和国招标投标法》)[第]*([\d\-]+)*条/,
        /(《建设工程质量管理条例》)[第]*([\d\-]+)*条/,
        /(《最高人民法院关于.*》)[第]*([\d\-]+)*条/,
      ];

      for (const pattern of lawPatterns) {
        const match = line.match(pattern);
        if (match) {
          const lawName = match[1];
          const clauseNumber = match[2] || '';
          
          // 检查法律是否已废止
          const abolishedInfo = this.ABOLISHED_LAWS.find(
            law => lawName.includes(law.name) || law.name.includes(lawName.replace(/[《》]/g, ''))
          );

          // 检查条款准确性
          const accuracyCheck = this.checkClauseAccuracy(lawName, clauseNumber, line);

          clauses.push({
            id: `legal-${clauseIndex++}`,
            contractClauseRef: `第${Math.floor(i / 10) + 1}条`,
            citedLaw: lawName,
            clauseNumber: clauseNumber || undefined,
            isAccurate: accuracyCheck.isAccurate,
            isValid: !abolishedInfo,
            isApplicable: accuracyCheck.isApplicable,
            issues: this.generateClauseIssues(abolishedInfo, accuracyCheck),
            correction: abolishedInfo 
              ? `应引用《${abolishedInfo.replacedBy}》对应条款`
              : accuracyCheck.correction,
          });
          break;
        }
      }
    }

    return clauses;
  }

  /**
   * 检查条款准确性
   */
  private checkClauseAccuracy(
    lawName: string, 
    clauseNumber: string, 
    context: string
  ): { isAccurate: boolean; isApplicable: boolean; correction?: string } {
    let isAccurate = true;
    let isApplicable = true;
    let correction: string | undefined;

    // 检查常见错误编号
    const commonMistakes: Record<string, { wrong: string; correct: string }> = {
      '中华人民共和国民法典': { wrong: '52', correct: '509' }, // 合同履行
    };

    const lawKey = lawName.replace(/[《》]/g, '');
    if (commonMistakes[lawKey] && clauseNumber === commonMistakes[lawKey].wrong) {
      isAccurate = false;
      correction = `${lawName}第${commonMistakes[lawKey].correct}条`;
    }

    // 检查适用性（简单启发式检查）
    if (/建设工程|施工|工程/.test(context) && !/建筑|工程|合同/.test(lawName)) {
      // 可能引用了不适用的法律
      isApplicable = false;
    }

    return { isAccurate, isApplicable, correction };
  }

  /**
   * 生成条款问题列表
   */
  private generateClauseIssues(
    abolishedInfo: { name: string; replacedBy: string; effectiveDate: string } | undefined,
    accuracyCheck: { isAccurate: boolean; isApplicable: boolean; correction?: string }
  ): string[] {
    const issues: string[] = [];

    if (abolishedInfo) {
      issues.push(`引用已废止法律，自${abolishedInfo.effectiveDate}起由《${abolishedInfo.replacedBy}》替代`);
    }

    if (!accuracyCheck.isAccurate) {
      issues.push('条款编号错误');
    }

    if (!accuracyCheck.isApplicable) {
      issues.push('引用条款与合同内容可能不适配');
    }

    return issues;
  }

  /**
   * 检查缺失的必要条款
   */
  private checkMissingClauses(contractText: string): string[] {
    const missing: string[] = [];

    for (const necessary of this.NECESSARY_CLAUSES) {
      const hasClause = this.checkHasClauseCategory(contractText, necessary.category);
      if (!hasClause) {
        missing.push(`${necessary.category}：${necessary.description}`);
      }
    }

    return missing;
  }

  /**
   * 检查是否包含某类法律条款
   */
  private checkHasClauseCategory(contractText: string, category: string): boolean {
    const categoryPatterns: Record<string, RegExp[]> = {
      '工程质量': [/质量|验收|标准|规范/, /《.*质量.*》|《.*验收.*》/],
      '违约责任': [/违约|责任|赔偿|损失|违约金/, /《.*合同.*》.*违约|《.*民法典.*》.*违约/],
      '争议解决': [/争议|仲裁|诉讼|管辖|法院/, /《.*仲裁.*》|《.*诉讼.*》/],
      '合同效力': [/效力|生效|无效|撤销|解除/, /《.*民法典.*》.*效力|《.*合同.*》.*效力/],
    };

    const patterns = categoryPatterns[category];
    if (!patterns) return true;

    // 检查是否有相关描述
    const hasDescription = patterns[0].test(contractText);
    // 检查是否有法律引用
    const hasLawReference = patterns[1] ? patterns[1].test(contractText) : true;

    return hasDescription && hasLawReference;
  }

  /**
   * 计算整体风险等级
   */
  private calculateOverallRisk(clauses: LegalClause[], missingClauses: string[]): RiskLevel {
    let highRiskCount = 0;
    let mediumRiskCount = 0;

    for (const clause of clauses) {
      if (!clause.isValid) highRiskCount++;
      if (!clause.isAccurate) mediumRiskCount++;
    }

    if (missingClauses.length > 2) mediumRiskCount++;

    if (highRiskCount > 0) return '高';
    if (mediumRiskCount > 1) return '中';
    return '低';
  }

  /**
   * 生成审查总结
   */
  private generateSummary(
    clauses: LegalClause[], 
    missingClauses: string[], 
    overallRiskLevel: RiskLevel
  ): string {
    const invalidCount = clauses.filter(c => !c.isValid).length;
    const inaccurateCount = clauses.filter(c => !c.isAccurate).length;
    const inapplicableCount = clauses.filter(c => !c.isApplicable).length;

    let summary = `共审查${clauses.length}个法律条款引用，`;
    
    if (invalidCount > 0) {
      summary += `发现${invalidCount}个已废止法律引用、`;
    }
    if (inaccurateCount > 0) {
      summary += `${inaccurateCount}个条款编号错误、`;
    }
    if (inapplicableCount > 0) {
      summary += `${inapplicableCount}个适用性存疑、`;
    }
    if (missingClauses.length > 0) {
      summary += `缺失${missingClauses.length}类必要条款、`;
    }
    
    summary = summary.replace(/、$/, '。');

    if (overallRiskLevel === '高') {
      summary += '存在引用已废止法律等重大风险，需立即纠正。';
    } else if (overallRiskLevel === '中') {
      summary += '法律条款引用存在一定问题，建议补充完善。';
    } else {
      summary += '法律条款引用基本规范。';
    }

    return summary;
  }
}

// 导出单例实例
export const legalClauseAgent = new LegalClauseAgent();
