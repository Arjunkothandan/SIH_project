// Heavy Metal Pollution Index Calculator
// Implements HPI, HEI, and MI calculations based on standard formulas

export interface MetalConcentration {
  metal: string;
  concentration: number; // in mg/L
  unit: 'mg/L' | 'ug/L' | 'ppb' | 'ppm';
  isNonDetect: boolean;
  detectionLimit?: number;
}

export interface RegulatoryStandard {
  metal: string;
  permissibleLimit: number; // in mg/L
  healthWeight: number;
  standard: 'WHO' | 'EPA' | 'IS_10500' | 'Custom';
}

export interface HMPIResult {
  hpi: number;
  hei: number;
  mi: number;
  category: 'Safe' | 'Moderate' | 'Poor' | 'Hazardous';
  metalAnalysis: Array<{
    metal: string;
    concentration: number;
    permissibleLimit: number;
    ratio: number;
    contribution: number;
    flag: 'Safe' | 'Caution' | 'Exceeded';
  }>;
  calculationDetails: {
    formula: string;
    parameters: any;
    timestamp: string;
  };
}

// WHO Standards (default)
export const WHO_STANDARDS: RegulatoryStandard[] = [
  { metal: 'As', permissibleLimit: 0.01, healthWeight: 10.0, standard: 'WHO' },
  { metal: 'Pb', permissibleLimit: 0.01, healthWeight: 8.0, standard: 'WHO' },
  { metal: 'Cd', permissibleLimit: 0.003, healthWeight: 9.0, standard: 'WHO' },
  { metal: 'Cr', permissibleLimit: 0.05, healthWeight: 6.0, standard: 'WHO' },
  { metal: 'Hg', permissibleLimit: 0.006, healthWeight: 9.5, standard: 'WHO' },
  { metal: 'Ni', permissibleLimit: 0.07, healthWeight: 5.0, standard: 'WHO' },
  { metal: 'Cu', permissibleLimit: 2.0, healthWeight: 3.0, standard: 'WHO' },
  { metal: 'Zn', permissibleLimit: 3.0, healthWeight: 2.0, standard: 'WHO' },
  { metal: 'Fe', permissibleLimit: 0.3, healthWeight: 2.5, standard: 'WHO' },
  { metal: 'Mn', permissibleLimit: 0.4, healthWeight: 3.5, standard: 'WHO' }
];

// EPA Standards
export const EPA_STANDARDS: RegulatoryStandard[] = [
  { metal: 'As', permissibleLimit: 0.01, healthWeight: 10.0, standard: 'EPA' },
  { metal: 'Pb', permissibleLimit: 0.015, healthWeight: 8.0, standard: 'EPA' },
  { metal: 'Cd', permissibleLimit: 0.005, healthWeight: 9.0, standard: 'EPA' },
  { metal: 'Cr', permissibleLimit: 0.1, healthWeight: 6.0, standard: 'EPA' },
  { metal: 'Hg', permissibleLimit: 0.002, healthWeight: 9.5, standard: 'EPA' },
  { metal: 'Ni', permissibleLimit: 0.1, healthWeight: 5.0, standard: 'EPA' },
  { metal: 'Cu', permissibleLimit: 1.3, healthWeight: 3.0, standard: 'EPA' }
];

export class HMPICalculator {
  private standards: RegulatoryStandard[];

  constructor(standards: RegulatoryStandard[] = WHO_STANDARDS) {
    this.standards = standards;
  }

  /**
   * Convert concentration to mg/L (standard unit)
   */
  private convertToMgL(concentration: number, unit: string): number {
    switch (unit) {
      case 'mg/L':
        return concentration;
      case 'ug/L':
      case 'ppb':
        return concentration / 1000; // Convert µg/L to mg/L
      case 'ppm':
        return concentration; // ppm is approximately mg/L for water
      default:
        return concentration;
    }
  }

  /**
   * Handle non-detect values
   */
  private handleNonDetect(
    concentration: number, 
    isNonDetect: boolean, 
    detectionLimit?: number,
    method: 'zero' | 'half_lod' | 'lod' | 'exclude' = 'half_lod'
  ): number | null {
    if (!isNonDetect) {
      return concentration;
    }

    switch (method) {
      case 'zero':
        return 0;
      case 'half_lod':
        return detectionLimit ? detectionLimit / 2 : 0;
      case 'lod':
        return detectionLimit || 0;
      case 'exclude':
        return null;
      default:
        return detectionLimit ? detectionLimit / 2 : 0;
    }
  }

  /**
   * Calculate Heavy Metal Pollution Index (HPI)
   * Formula: HPI = Σ(Wi × Qi) / Σ(Wi)
   * Where: Wi = relative weight, Qi = sub-index for each metal
   */
  calculateHPI(concentrations: MetalConcentration[]): number {
    let numerator = 0;
    let denominator = 0;

    for (const conc of concentrations) {
      const standard = this.standards.find(s => s.metal === conc.metal);
      if (!standard) continue;

      // Convert to mg/L and handle non-detects
      const concMgL = this.convertToMgL(conc.concentration, conc.unit);
      const actualConc = this.handleNonDetect(
        concMgL, 
        conc.isNonDetect, 
        conc.detectionLimit
      );

      if (actualConc === null) continue;

      // Calculate sub-index Qi = (Actual - Ideal) / (Standard - Ideal) * 100
      // Ideal concentration is assumed to be 0 for heavy metals
      const qi = (actualConc - 0) / (standard.permissibleLimit - 0) * 100;
      
      // Weight (Wi) is often taken as inverse of permissible limit or health weight
      const wi = standard.healthWeight;

      numerator += wi * qi;
      denominator += wi;
    }

    return denominator > 0 ? numerator / denominator : 0;
  }

  /**
   * Calculate Heavy Metal Evaluation Index (HEI)
   * Formula: HEI = Σ(Ci / Li)
   * Where: Ci = concentration, Li = permissible limit
   */
  calculateHEI(concentrations: MetalConcentration[]): number {
    let sum = 0;

    for (const conc of concentrations) {
      const standard = this.standards.find(s => s.metal === conc.metal);
      if (!standard) continue;

      const concMgL = this.convertToMgL(conc.concentration, conc.unit);
      const actualConc = this.handleNonDetect(
        concMgL, 
        conc.isNonDetect, 
        conc.detectionLimit
      );

      if (actualConc === null) continue;

      sum += actualConc / standard.permissibleLimit;
    }

    return sum;
  }

  /**
   * Calculate Metal Index (MI)
   * Formula: MI = Σ(Ci / Li) / n
   * Where: Ci = concentration, Li = permissible limit, n = number of metals
   */
  calculateMI(concentrations: MetalConcentration[]): number {
    const hei = this.calculateHEI(concentrations);
    const validMetals = concentrations.filter(conc => {
      const standard = this.standards.find(s => s.metal === conc.metal);
      return standard && this.handleNonDetect(
        this.convertToMgL(conc.concentration, conc.unit), 
        conc.isNonDetect, 
        conc.detectionLimit
      ) !== null;
    }).length;

    return validMetals > 0 ? hei / validMetals : 0;
  }

  /**
   * Determine pollution category based on indices
   */
  determinateCategory(hpi: number, hei: number, mi: number): 'Safe' | 'Moderate' | 'Poor' | 'Hazardous' {
    // Category determination based on scientific literature
    // HPI: <15 (Safe), 15-30 (Moderate), 30-70 (Poor), >70 (Hazardous)
    // HEI: <10 (Safe), 10-20 (Moderate), 20-40 (Poor), >40 (Hazardous)
    
    if (hpi > 70 || hei > 40 || mi > 40) {
      return 'Hazardous';
    } else if (hpi > 30 || hei > 20 || mi > 20) {
      return 'Poor';
    } else if (hpi > 15 || hei > 10 || mi > 10) {
      return 'Moderate';
    } else {
      return 'Safe';
    }
  }

  /**
   * Perform individual metal analysis
   */
  analyzeMetals(concentrations: MetalConcentration[]) {
    const analysis = [];

    for (const conc of concentrations) {
      const standard = this.standards.find(s => s.metal === conc.metal);
      if (!standard) continue;

      const concMgL = this.convertToMgL(conc.concentration, conc.unit);
      const actualConc = this.handleNonDetect(
        concMgL, 
        conc.isNonDetect, 
        conc.detectionLimit
      );

      if (actualConc === null) continue;

      const ratio = actualConc / standard.permissibleLimit;
      let flag: 'Safe' | 'Caution' | 'Exceeded';

      if (ratio <= 0.5) {
        flag = 'Safe';
      } else if (ratio <= 1.0) {
        flag = 'Caution';
      } else {
        flag = 'Exceeded';
      }

      analysis.push({
        metal: conc.metal,
        concentration: actualConc,
        permissibleLimit: standard.permissibleLimit,
        ratio: ratio,
        contribution: (actualConc / standard.permissibleLimit) * standard.healthWeight,
        flag: flag
      });
    }

    return analysis;
  }

  /**
   * Main calculation function
   */
  calculate(concentrations: MetalConcentration[]): HMPIResult {
    const hpi = this.calculateHPI(concentrations);
    const hei = this.calculateHEI(concentrations);
    const mi = this.calculateMI(concentrations);
    const category = this.determinateCategory(hpi, hei, mi);
    const metalAnalysis = this.analyzeMetals(concentrations);

    return {
      hpi: Math.round(hpi * 100) / 100,
      hei: Math.round(hei * 100) / 100,
      mi: Math.round(mi * 100) / 100,
      category,
      metalAnalysis,
      calculationDetails: {
        formula: 'HPI = Σ(Wi × Qi) / Σ(Wi), HEI = Σ(Ci / Li), MI = HEI / n',
        parameters: {
          standards: this.standards.map(s => s.standard).join(', '),
          nonDetectHandling: 'half_lod',
          metals: concentrations.map(c => c.metal).join(', ')
        },
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Batch calculate for multiple samples
   */
  batchCalculate(samples: Array<{
    sampleId: string;
    concentrations: MetalConcentration[];
  }>): Array<{ sampleId: string; result: HMPIResult }> {
    return samples.map(sample => ({
      sampleId: sample.sampleId,
      result: this.calculate(sample.concentrations)
    }));
  }

  /**
   * Export calculation as CSV
   */
  exportToCSV(results: HMPIResult[]): string {
    const headers = ['Sample', 'HPI', 'HEI', 'MI', 'Category', 'Metals_Analyzed', 'High_Risk_Metals'];
    const rows = results.map((result, index) => {
      const highRiskMetals = result.metalAnalysis
        .filter(m => m.flag === 'Exceeded')
        .map(m => m.metal)
        .join(';');

      return [
        `Sample_${index + 1}`,
        result.hpi,
        result.hei,
        result.mi,
        result.category,
        result.metalAnalysis.length,
        highRiskMetals || 'None'
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}