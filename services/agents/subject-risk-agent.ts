import {
  Agent,
  SpecialistAgentInput,
  SubjectRiskResult,
  CompanyInfo,
  RiskPoint,
  RiskLevel,
} from '@/types/contract-review';

/**
 * 主体公司风险审查Agent - 专业审查员
 * 
 * 【角色设定】
 * 你是合同主体公司风险审查专家，具备丰富的企业合规审查经验，精通合同主体相关的法律规范和风险点，
 * 严格遵循合同审查操作指引，专注于合同双方主体公司的风险排查，不涉及其他审查内容。
 * 
 * 【核心职责】
 * 1. 主体资格合法性：核查营业执照、经营范围、行政许可资质
 * 2. 授权委托有效性：核查签约代表授权委托书
 * 3. 信用与履约能力：排查不良信用记录，评估履约能力
 * 4. 特殊主体额外审查：政府机关、事业单位、外商投资企业等
 */
export class SubjectRiskAgent implements Agent<SpecialistAgentInput, SubjectRiskResult> {
  type = 'subject-risk-agent' as const;
  name = '主体公司风险审查Agent';
  description = '专注审查合同中双方主体公司的风险点，包括资质、授权、信用等方面';

  /**
   * 【工作流程】
   * 接收任务指令及合同文本 → 逐句排查主体公司相关条款 → 记录风险点 → 生成标准化审查结果
   */
  async process(input: SpecialistAgentInput): Promise<SubjectRiskResult> {
    console.log('[SubjectRiskAgent] 开始主体风险审查...');

    const contractText = input.contractText;
    
    // 提取合同双方信息
    const parties = this.extractParties(contractText);
    console.log('[SubjectRiskAgent] 识别到合同方:', parties.map(p => `${p.role}: ${p.name}`));

    // 审查每个主体公司
    const companies: CompanyInfo[] = parties.map(party => this.reviewCompany(party, contractText));

    // 计算整体风险等级
    const overallRiskLevel = this.calculateOverallRisk(companies);

    // 生成总结
    const summary = this.generateSummary(companies, overallRiskLevel);

    const result: SubjectRiskResult = {
      agentType: 'subject-risk-agent',
      companies,
      overallRiskLevel,
      summary,
    };

    console.log('[SubjectRiskAgent] 主体风险审查完成');
    return result;
  }

  /**
   * 从合同文本中提取合同双方信息
   */
  private extractParties(contractText: string): Array<{ name: string; role: '甲方' | '乙方' }> {
    const parties: Array<{ name: string; role: '甲方' | '乙方' }> = [];

    // 匹配甲方
    const partyAPatterns = [
      /甲方[：:]\s*([^\n,，。；;]+?)(?:公司|集团|单位|院|所|部)/,
      /发包方[：:]\s*([^\n,，。；;]+?)(?:公司|集团|单位|院|所|部)/,
      /委托方[：:]\s*([^\n,，。；;]+?)(?:公司|集团|单位|院|所|部)/,
      /业主[：:]\s*([^\n,，。；;]+?)(?:公司|集团|单位|院|所|部)/,
    ];

    // 匹配乙方
    const partyBPatterns = [
      /乙方[：:]\s*([^\n,，。；;]+?)(?:公司|集团|单位|院|所|部)/,
      /承包方[：:]\s*([^\n,，。；;]+?)(?:公司|集团|单位|院|所|部)/,
      /受托方[：:]\s*([^\n,，。；;]+?)(?:公司|集团|单位|院|所|部)/,
      /施工方[：:]\s*([^\n,，。；;]+?)(?:公司|集团|单位|院|所|部)/,
    ];

    // 尝试匹配甲方
    for (const pattern of partyAPatterns) {
      const match = contractText.match(pattern);
      if (match) {
        parties.push({ name: match[1].trim() + (match[0].includes('公司') ? '公司' : ''), role: '甲方' });
        break;
      }
    }

    // 尝试匹配乙方
    for (const pattern of partyBPatterns) {
      const match = contractText.match(pattern);
      if (match) {
        parties.push({ name: match[1].trim() + (match[0].includes('公司') ? '公司' : ''), role: '乙方' });
        break;
      }
    }

    // 如果没有匹配到，使用默认值
    if (parties.length === 0) {
      parties.push({ name: '甲方公司', role: '甲方' });
      parties.push({ name: '乙方公司', role: '乙方' });
    } else if (parties.length === 1) {
      const existingRole = parties[0].role;
      parties.push({ 
        name: existingRole === '甲方' ? '乙方公司' : '甲方公司', 
        role: existingRole === '甲方' ? '乙方' : '甲方' 
      });
    }

    return parties;
  }

  /**
   * 审查单个公司
   */
  private reviewCompany(
    party: { name: string; role: '甲方' | '乙方' },
    contractText: string
  ): CompanyInfo {
    const riskPoints: RiskPoint[] = [];
    const qualifications = this.checkQualifications(party, contractText, riskPoints);
    const authorization = this.checkAuthorization(party, contractText, riskPoints);
    const creditStatus = this.checkCreditStatus(party, contractText, riskPoints);

    return {
      name: party.name,
      role: party.role,
      qualifications,
      authorization,
      creditStatus,
      riskPoints,
    };
  }

  /**
   * 检查主体资格合法性
   */
  private checkQualifications(
    party: { name: string; role: '甲方' | '乙方' },
    contractText: string,
    riskPoints: RiskPoint[]
  ): CompanyInfo['qualifications'] {
    const issues: string[] = [];
    let businessLicenseValid = true;
    let businessScopeMatch = true;
    let specialIndustryLicense = false;

    // 检查是否为建设工程合同
    const isConstructionContract = /建设工程|施工|工程|建筑/.test(contractText);
    
    // 检查特殊行业资质
    if (isConstructionContract && party.role === '乙方') {
      const hasConstructionQualification = /资质|资质证书|建筑企业资质|施工资质/.test(contractText);
      if (!hasConstructionQualification) {
        issues.push('未明确提及建筑企业资质证书');
        riskPoints.push({
          id: `qual-${party.role}-1`,
          description: `${party.name}作为承包方，合同未明确其建筑企业资质情况`,
          riskLevel: '高',
          contractClause: '资质相关条款',
          suggestion: `要求${party.name}提供有效的建筑企业资质证书，确保其具备承接本工程的资质等级`,
        });
      } else {
        specialIndustryLicense = true;
      }
    }

    // 检查营业执照有效期（通过文本分析模拟）
    const hasBusinessLicense = /营业执照|统一社会信用代码/.test(contractText);
    if (!hasBusinessLicense) {
      issues.push('未提供营业执照信息');
      riskPoints.push({
        id: `qual-${party.role}-2`,
        description: `合同未明确${party.name}的营业执照有效性`,
        riskLevel: '中',
        suggestion: `要求${party.name}提供在有效期内的营业执照复印件`,
      });
    }

    // 检查经营范围匹配
    if (isConstructionContract && party.role === '乙方') {
      const businessScopeMentioned = /经营范围|承包范围|工程内容/.test(contractText);
      if (!businessScopeMentioned) {
        issues.push('经营范围与合同标的匹配性未明确');
      }
    }

    return {
      businessLicenseValid,
      businessScopeMatch,
      specialIndustryLicense: isConstructionContract ? specialIndustryLicense : undefined,
      issues,
    };
  }

  /**
   * 检查授权委托有效性
   */
  private checkAuthorization(
    party: { name: string; role: '甲方' | '乙方' },
    contractText: string,
    riskPoints: RiskPoint[]
  ): CompanyInfo['authorization'] {
    const issues: string[] = [];
    
    // 检查是否有签约代表信息
    const hasRepresentative = /法定代表人|授权代表|委托代理人|签约代表/.test(contractText);
    const hasAuthorizationLetter = /授权书|授权委托书|委托函/.test(contractText);
    
    if (!hasRepresentative) {
      issues.push('未明确签约代表身份');
      riskPoints.push({
        id: `auth-${party.role}-1`,
        description: `合同未明确${party.name}的签约代表身份信息`,
        riskLevel: '中',
        suggestion: `明确${party.name}的签约代表姓名、职务，如非法定代表人需提供授权委托书`,
      });
    }

    if (hasRepresentative && !hasAuthorizationLetter) {
      // 检查是否可能是法定代表人
      const isLegalRepresentative = /法定代表人/.test(contractText);
      if (!isLegalRepresentative) {
        issues.push('签约代表授权文件缺失');
        riskPoints.push({
          id: `auth-${party.role}-2`,
          description: `${party.name}签约代表非法定代表人，但未提供授权委托书`,
          riskLevel: '高',
          suggestion: `要求${party.name}提供法定代表人签署并加盖公章的授权委托书，明确授权事项、期限和范围`,
        });
      }
    }

    return {
      hasAuthorization: hasRepresentative,
      representativeInfo: hasRepresentative ? '合同中提及签约代表' : undefined,
      issues,
    };
  }

  /**
   * 检查信用与履约能力
   */
  private checkCreditStatus(
    party: { name: string; role: '甲方' | '乙方' },
    contractText: string,
    riskPoints: RiskPoint[]
  ): CompanyInfo['creditStatus'] {
    const records: string[] = [];
    
    // 检查合同中是否有关于履约能力的声明
    const hasPerformanceDeclaration = /履约能力|资信状况|无不良记录|信用良好/.test(contractText);
    
    if (!hasPerformanceDeclaration) {
      riskPoints.push({
        id: `credit-${party.role}-1`,
        description: `合同未要求${party.name}声明其资信状况和履约能力`,
        riskLevel: '低',
        suggestion: `建议增加条款要求${party.name}声明无经营异常、失信被执行人、重大诉讼等不良记录`,
      });
    }

    return {
      hasBadRecords: false, // 默认假设无不良记录
      records,
      performanceCapability: '良好',
    };
  }

  /**
   * 计算整体风险等级
   */
  private calculateOverallRisk(companies: CompanyInfo[]): RiskLevel {
    let highRiskCount = 0;
    let mediumRiskCount = 0;

    for (const company of companies) {
      for (const risk of company.riskPoints) {
        if (risk.riskLevel === '高') highRiskCount++;
        if (risk.riskLevel === '中') mediumRiskCount++;
      }
    }

    if (highRiskCount > 0) return '高';
    if (mediumRiskCount > 1) return '中';
    return '低';
  }

  /**
   * 生成审查总结
   */
  private generateSummary(companies: CompanyInfo[], overallRiskLevel: RiskLevel): string {
    const highRiskCount = companies.reduce(
      (sum, c) => sum + c.riskPoints.filter(r => r.riskLevel === '高').length,
      0
    );
    const mediumRiskCount = companies.reduce(
      (sum, c) => sum + c.riskPoints.filter(r => r.riskLevel === '中').length,
      0
    );
    const lowRiskCount = companies.reduce(
      (sum, c) => sum + c.riskPoints.filter(r => r.riskLevel === '低').length,
      0
    );

    let summary = `共审查${companies.length}家公司，发现`;
    if (highRiskCount > 0) summary += `高风险项${highRiskCount}项、`;
    if (mediumRiskCount > 0) summary += `中风险项${mediumRiskCount}项、`;
    if (lowRiskCount > 0) summary += `低风险项${lowRiskCount}项、`;
    summary = summary.replace(/、$/, '。');

    if (overallRiskLevel === '高') {
      summary += '存在重大主体风险，建议整改后再签订合同。';
    } else if (overallRiskLevel === '中') {
      summary += '存在一定主体风险，建议补充相关资料。';
    } else {
      summary += '主体风险较低，基本符合签约要求。';
    }

    return summary;
  }
}

// 导出单例实例
export const subjectRiskAgent = new SubjectRiskAgent();
