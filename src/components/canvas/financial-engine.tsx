'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Minus,
  Plus,
  SlidersHorizontal,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface FinancialInputs {
  // Revenue
  unitPrice: number;
  unitsPerMonth: number;
  growthRateYear1: number; // % monthly growth
  growthRateYear2: number;
  growthRateYear3: number;
  // Costs
  fixedCostsSalaries: number;
  fixedCostsRent: number;
  fixedCostsOther: number;
  variableCostPercent: number; // % of revenue
  // Funding
  initialInvestment: number;
  loanAmount: number;
  loanInterestRate: number; // annual %
  loanDurationMonths: number;
  // Working Capital (BFR)
  clientPaymentDays: number;
  supplierPaymentDays: number;
  stockDays: number;
  // Tax
  taxRate: number; // % corporate tax
  currency: string;
}

interface MonthlyData {
  month: number;
  label: string;
  revenue: number;
  variableCosts: number;
  fixedCosts: number;
  totalCosts: number;
  grossMargin: number;
  netIncome: number;
  cashflow: number;
  cumulativeCashflow: number;
}

interface YearlyData {
  year: number;
  revenue: number;
  variableCosts: number;
  fixedCosts: number;
  grossMargin: number;
  grossMarginPercent: number;
  operatingIncome: number;
  tax: number;
  netIncome: number;
  netMarginPercent: number;
}

// ============================================
// DEFAULT INPUTS (contexte Afrique / XAF)
// ============================================

const DEFAULT_INPUTS: FinancialInputs = {
  unitPrice: 25000,
  unitsPerMonth: 50,
  growthRateYear1: 8,
  growthRateYear2: 5,
  growthRateYear3: 3,
  fixedCostsSalaries: 800000,
  fixedCostsRent: 150000,
  fixedCostsOther: 100000,
  variableCostPercent: 30,
  initialInvestment: 5000000,
  loanAmount: 0,
  loanInterestRate: 12,
  loanDurationMonths: 36,
  clientPaymentDays: 30,
  supplierPaymentDays: 45,
  stockDays: 15,
  taxRate: 30,
  currency: 'XAF',
};

// ============================================
// HELPERS
// ============================================

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'XAF' || currency === 'XOF') {
    return new Intl.NumberFormat('fr-FR', { style: 'decimal', maximumFractionDigits: 0 }).format(Math.round(amount)) + ' ' + currency;
  }
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Math.round(amount));
}

function formatPercent(value: number): string {
  return value.toFixed(1) + '%';
}

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

// ============================================
// COMPUTATION ENGINE
// ============================================

function computeFinancials(inputs: FinancialInputs) {
  const totalFixedCosts = inputs.fixedCostsSalaries + inputs.fixedCostsRent + inputs.fixedCostsOther;
  const monthlyLoanPayment = inputs.loanAmount > 0
    ? (inputs.loanAmount * (inputs.loanInterestRate / 100 / 12)) /
      (1 - Math.pow(1 + inputs.loanInterestRate / 100 / 12, -inputs.loanDurationMonths))
    : 0;

  // Monthly data for 36 months
  const monthly: MonthlyData[] = [];
  let currentUnits = inputs.unitsPerMonth;
  let cumulativeCashflow = inputs.initialInvestment + inputs.loanAmount;
  let breakEvenMonth = -1;
  let breakEvenReached = false;

  for (let m = 1; m <= 36; m++) {
    const yearIndex = Math.ceil(m / 12);
    const growthRate = yearIndex === 1
      ? inputs.growthRateYear1
      : yearIndex === 2
        ? inputs.growthRateYear2
        : inputs.growthRateYear3;

    if (m > 1) {
      currentUnits *= (1 + growthRate / 100);
    }

    const revenue = Math.round(currentUnits * inputs.unitPrice);
    const variableCosts = Math.round(revenue * inputs.variableCostPercent / 100);
    const fixedCosts = totalFixedCosts + monthlyLoanPayment;
    const totalCosts = variableCosts + fixedCosts;
    const grossMargin = revenue - variableCosts;
    const netIncome = revenue - totalCosts;
    const cashflow = netIncome;
    cumulativeCashflow += cashflow;

    if (!breakEvenReached && netIncome >= 0) {
      breakEvenMonth = m;
      breakEvenReached = true;
    }

    monthly.push({
      month: m,
      label: MONTH_LABELS[(m - 1) % 12],
      revenue,
      variableCosts,
      fixedCosts,
      totalCosts,
      grossMargin,
      netIncome,
      cashflow,
      cumulativeCashflow,
    });
  }

  // Yearly aggregates
  const yearly: YearlyData[] = [];
  for (let y = 0; y < 3; y++) {
    const yearMonths = monthly.slice(y * 12, (y + 1) * 12);
    const revenue = yearMonths.reduce((s, m) => s + m.revenue, 0);
    const variableCosts = yearMonths.reduce((s, m) => s + m.variableCosts, 0);
    const fixedCosts = yearMonths.reduce((s, m) => s + m.fixedCosts, 0);
    const grossMargin = revenue - variableCosts;
    const operatingIncome = grossMargin - fixedCosts;
    const tax = operatingIncome > 0 ? Math.round(operatingIncome * inputs.taxRate / 100) : 0;
    const netIncome = operatingIncome - tax;

    yearly.push({
      year: y + 1,
      revenue,
      variableCosts,
      fixedCosts,
      grossMargin,
      grossMarginPercent: revenue > 0 ? (grossMargin / revenue) * 100 : 0,
      operatingIncome,
      tax,
      netIncome,
      netMarginPercent: revenue > 0 ? (netIncome / revenue) * 100 : 0,
    });
  }

  // BFR (Besoin en Fonds de Roulement)
  const avgMonthlyRevenue = yearly[0].revenue / 12;
  const avgMonthlyCosts = (yearly[0].variableCosts + yearly[0].fixedCosts) / 12;
  const clientReceivables = (avgMonthlyRevenue / 30) * inputs.clientPaymentDays;
  const supplierPayables = (avgMonthlyCosts / 30) * inputs.supplierPaymentDays;
  const stockValue = (avgMonthlyCosts / 30) * inputs.stockDays;
  const bfr = Math.round(clientReceivables + stockValue - supplierPayables);

  // Initial funding plan
  const totalFundingNeeded = totalFixedCosts * 3 + bfr; // 3 months runway + BFR
  const fundingGap = Math.max(0, totalFundingNeeded - inputs.initialInvestment - inputs.loanAmount);

  return {
    monthly,
    yearly,
    breakEvenMonth,
    totalFixedCosts,
    monthlyLoanPayment,
    bfr,
    clientReceivables: Math.round(clientReceivables),
    supplierPayables: Math.round(supplierPayables),
    stockValue: Math.round(stockValue),
    totalFundingNeeded: Math.round(totalFundingNeeded),
    fundingGap: Math.round(fundingGap),
  };
}

// ============================================
// SLIDER COMPONENT
// ============================================

function FinancialSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix = '',
  prefix = '',
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs font-semibold tabular-nums">
          {prefix}{new Intl.NumberFormat('fr-FR').format(value)}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted accent-primary"
      />
    </div>
  );
}

// ============================================
// MINI BAR CHART (pure CSS)
// ============================================

function MiniBarChart({ data, maxVal, color = 'bg-primary' }: { data: number[]; maxVal: number; color?: string }) {
  return (
    <div className="flex items-end gap-0.5 h-16 w-full">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-t-sm transition-all duration-300 ${v >= 0 ? color : 'bg-red-500'}`}
          style={{ height: `${Math.max(2, Math.abs(v) / maxVal * 100)}%`, opacity: v >= 0 ? 1 : 0.7 }}
          title={`M${i + 1}: ${new Intl.NumberFormat('fr-FR').format(v)}`}
        />
      ))}
    </div>
  );
}

// ============================================
// KPI CARD
// ============================================

function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = 'default',
}: {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const variantStyles = {
    default: 'bg-card border',
    success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    danger: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
  };
  const iconStyles = {
    default: 'text-primary bg-primary/10',
    success: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900',
    warning: 'text-amber-600 bg-amber-100 dark:bg-amber-900',
    danger: 'text-red-600 bg-red-100 dark:bg-red-900',
  };

  return (
    <div className={`rounded-xl p-4 ${variantStyles[variant]} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <div className="flex items-center gap-1">
              {trend === 'up' && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
              {trend === 'down' && <ArrowDownRight className="w-3 h-3 text-red-500" />}
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            </div>
          )}
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconStyles[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

interface FinancialEngineProps {
  initialData?: Partial<FinancialInputs>;
  projectName?: string;
  currency?: string;
}

export function FinancialEngine({ initialData, projectName, currency = 'XAF' }: FinancialEngineProps) {
  const [inputs, setInputs] = useState<FinancialInputs>({
    ...DEFAULT_INPUTS,
    currency,
    ...initialData,
  });
  const [activeSection, setActiveSection] = useState<'overview' | 'income' | 'cashflow' | 'bfr'>('overview');

  const updateInput = useCallback((key: keyof FinancialInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const results = useMemo(() => computeFinancials(inputs), [inputs]);
  const { monthly, yearly, breakEvenMonth, bfr, totalFundingNeeded, fundingGap } = results;
  const c = inputs.currency;

  // First 12 months for cashflow chart
  const first12 = monthly.slice(0, 12);
  const maxRevenue = Math.max(...first12.map(m => m.revenue), 1);
  const maxCashflow = Math.max(...first12.map(m => Math.abs(m.cumulativeCashflow)), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Moteur Financier Prévisionnel
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Projections dynamiques sur 36 mois — Conformité OHADA
            {projectName && <> — <strong>{projectName}</strong></>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['overview', 'income', 'cashflow', 'bfr'] as const).map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSection === section
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {section === 'overview' && 'Vue d\'ensemble'}
              {section === 'income' && 'Compte de résultat'}
              {section === 'cashflow' && 'Trésorerie'}
              {section === 'bfr' && 'BFR & Financement'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Sliders */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Hypothèses (What-If)
              </CardTitle>
              <CardDescription className="text-xs">
                Ajustez les curseurs pour voir l'impact en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-primary mb-3">💰 Revenus</p>
                <div className="space-y-3">
                  <FinancialSlider
                    label="Prix unitaire"
                    value={inputs.unitPrice}
                    onChange={v => updateInput('unitPrice', v)}
                    min={1000}
                    max={500000}
                    step={1000}
                    suffix={` ${c}`}
                  />
                  <FinancialSlider
                    label="Unités / mois (départ)"
                    value={inputs.unitsPerMonth}
                    onChange={v => updateInput('unitsPerMonth', v)}
                    min={1}
                    max={1000}
                    step={1}
                  />
                  <FinancialSlider
                    label="Croissance mensuelle An 1"
                    value={inputs.growthRateYear1}
                    onChange={v => updateInput('growthRateYear1', v)}
                    min={0}
                    max={30}
                    step={0.5}
                    suffix="%"
                  />
                  <FinancialSlider
                    label="Croissance mensuelle An 2"
                    value={inputs.growthRateYear2}
                    onChange={v => updateInput('growthRateYear2', v)}
                    min={0}
                    max={20}
                    step={0.5}
                    suffix="%"
                  />
                  <FinancialSlider
                    label="Croissance mensuelle An 3"
                    value={inputs.growthRateYear3}
                    onChange={v => updateInput('growthRateYear3', v)}
                    min={0}
                    max={15}
                    step={0.5}
                    suffix="%"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-red-500 mb-3">📉 Charges fixes / mois</p>
                <div className="space-y-3">
                  <FinancialSlider
                    label="Salaires & charges sociales"
                    value={inputs.fixedCostsSalaries}
                    onChange={v => updateInput('fixedCostsSalaries', v)}
                    min={0}
                    max={10000000}
                    step={50000}
                    suffix={` ${c}`}
                  />
                  <FinancialSlider
                    label="Loyer & charges locatives"
                    value={inputs.fixedCostsRent}
                    onChange={v => updateInput('fixedCostsRent', v)}
                    min={0}
                    max={2000000}
                    step={10000}
                    suffix={` ${c}`}
                  />
                  <FinancialSlider
                    label="Autres charges fixes"
                    value={inputs.fixedCostsOther}
                    onChange={v => updateInput('fixedCostsOther', v)}
                    min={0}
                    max={3000000}
                    step={10000}
                    suffix={` ${c}`}
                  />
                  <FinancialSlider
                    label="Charges variables (% CA)"
                    value={inputs.variableCostPercent}
                    onChange={v => updateInput('variableCostPercent', v)}
                    min={0}
                    max={80}
                    step={1}
                    suffix="%"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-blue-500 mb-3">🏦 Financement</p>
                <div className="space-y-3">
                  <FinancialSlider
                    label="Apport initial"
                    value={inputs.initialInvestment}
                    onChange={v => updateInput('initialInvestment', v)}
                    min={0}
                    max={100000000}
                    step={500000}
                    suffix={` ${c}`}
                  />
                  <FinancialSlider
                    label="Emprunt bancaire"
                    value={inputs.loanAmount}
                    onChange={v => updateInput('loanAmount', v)}
                    min={0}
                    max={100000000}
                    step={500000}
                    suffix={` ${c}`}
                  />
                  {inputs.loanAmount > 0 && (
                    <>
                      <FinancialSlider
                        label="Taux d'intérêt annuel"
                        value={inputs.loanInterestRate}
                        onChange={v => updateInput('loanInterestRate', v)}
                        min={1}
                        max={25}
                        step={0.5}
                        suffix="%"
                      />
                      <FinancialSlider
                        label="Durée (mois)"
                        value={inputs.loanDurationMonths}
                        onChange={v => updateInput('loanDurationMonths', v)}
                        min={6}
                        max={84}
                        step={6}
                      />
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-amber-500 mb-3">⏳ BFR (Délais de paiement)</p>
                <div className="space-y-3">
                  <FinancialSlider
                    label="Délai paiement clients"
                    value={inputs.clientPaymentDays}
                    onChange={v => updateInput('clientPaymentDays', v)}
                    min={0}
                    max={120}
                    step={5}
                    suffix=" jours"
                  />
                  <FinancialSlider
                    label="Délai paiement fournisseurs"
                    value={inputs.supplierPaymentDays}
                    onChange={v => updateInput('supplierPaymentDays', v)}
                    min={0}
                    max={120}
                    step={5}
                    suffix=" jours"
                  />
                  <FinancialSlider
                    label="Durée de stockage"
                    value={inputs.stockDays}
                    onChange={v => updateInput('stockDays', v)}
                    min={0}
                    max={90}
                    step={5}
                    suffix=" jours"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* ============= OVERVIEW ============= */}
          {activeSection === 'overview' && (
            <>
              {/* KPI Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KPICard
                  title="CA Année 1"
                  value={formatCurrency(yearly[0].revenue, c)}
                  subtitle={`Marge nette ${formatPercent(yearly[0].netMarginPercent)}`}
                  trend={yearly[0].netIncome >= 0 ? 'up' : 'down'}
                  icon={DollarSign}
                  variant={yearly[0].netIncome >= 0 ? 'success' : 'warning'}
                />
                <KPICard
                  title="Seuil de Rentabilité"
                  value={breakEvenMonth > 0 ? `Mois ${breakEvenMonth}` : 'Non atteint'}
                  subtitle={breakEvenMonth > 0 ? `${breakEvenMonth > 12 ? '⚠️ Après An 1' : '✅ Avant An 1'}` : '❌ sur 36 mois'}
                  icon={TrendingUp}
                  variant={breakEvenMonth > 0 && breakEvenMonth <= 18 ? 'success' : breakEvenMonth > 0 ? 'warning' : 'danger'}
                />
                <KPICard
                  title="BFR Initial"
                  value={formatCurrency(bfr, c)}
                  subtitle={`${inputs.clientPaymentDays}j clients, ${inputs.supplierPaymentDays}j fournisseurs`}
                  icon={BarChart3}
                  variant={bfr > inputs.initialInvestment * 0.5 ? 'warning' : 'default'}
                />
                <KPICard
                  title="Besoin Total"
                  value={formatCurrency(totalFundingNeeded, c)}
                  subtitle={fundingGap > 0 ? `⚠️ Gap: ${formatCurrency(fundingGap, c)}` : '✅ Couvert'}
                  icon={PieChart}
                  variant={fundingGap > 0 ? 'danger' : 'success'}
                />
              </div>

              {/* Revenue Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Évolution du CA mensuel — Année 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <MiniBarChart
                    data={first12.map(m => m.revenue)}
                    maxVal={maxRevenue}
                    color="bg-emerald-500"
                  />
                  <div className="flex justify-between mt-2">
                    {first12.map(m => (
                      <span key={m.month} className="text-[9px] text-muted-foreground">{m.label}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Net Income Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Résultat net mensuel — Année 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <MiniBarChart
                    data={first12.map(m => m.netIncome)}
                    maxVal={Math.max(...first12.map(m => Math.abs(m.netIncome)), 1)}
                  />
                  <div className="flex justify-between mt-2">
                    {first12.map(m => (
                      <span key={m.month} className="text-[9px] text-muted-foreground">{m.label}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Yearly Summary Table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Synthèse Prévisionnelle 3 ans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium text-muted-foreground">Poste</th>
                          {yearly.map(y => (
                            <th key={y.year} className="text-right py-2 font-semibold">Année {y.year}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="py-2 font-medium">Chiffre d&apos;Affaires</td>
                          {yearly.map(y => (
                            <td key={y.year} className="text-right py-2 font-semibold text-emerald-600">
                              {formatCurrency(y.revenue, c)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-2 text-muted-foreground">Charges variables</td>
                          {yearly.map(y => (
                            <td key={y.year} className="text-right py-2 text-red-500">
                              -{formatCurrency(y.variableCosts, c)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-2 font-medium">Marge brute</td>
                          {yearly.map(y => (
                            <td key={y.year} className="text-right py-2">
                              {formatCurrency(y.grossMargin, c)} <span className="text-muted-foreground">({formatPercent(y.grossMarginPercent)})</span>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-2 text-muted-foreground">Charges fixes</td>
                          {yearly.map(y => (
                            <td key={y.year} className="text-right py-2 text-red-500">
                              -{formatCurrency(y.fixedCosts, c)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-2 font-medium">Résultat d&apos;exploitation</td>
                          {yearly.map(y => (
                            <td key={y.year} className={`text-right py-2 font-medium ${y.operatingIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {formatCurrency(y.operatingIncome, c)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-2 text-muted-foreground">Impôt ({inputs.taxRate}%)</td>
                          {yearly.map(y => (
                            <td key={y.year} className="text-right py-2 text-muted-foreground">
                              -{formatCurrency(y.tax, c)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t-2 border-primary/20">
                          <td className="py-2 font-bold">Résultat Net</td>
                          {yearly.map(y => (
                            <td key={y.year} className={`text-right py-2 font-bold text-lg ${y.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {formatCurrency(y.netIncome, c)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-2 text-muted-foreground">Marge nette</td>
                          {yearly.map(y => (
                            <td key={y.year} className={`text-right py-2 ${y.netMarginPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {formatPercent(y.netMarginPercent)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ============= INCOME STATEMENT ============= */}
          {activeSection === 'income' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Compte de Résultat Prévisionnel Mensuel — Année 1
                </CardTitle>
                <CardDescription className="text-xs">
                  Détail mois par mois (OHADA)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-muted-foreground sticky left-0 bg-card z-10">Poste</th>
                        {first12.map(m => (
                          <th key={m.month} className="text-right py-2 font-medium min-w-20">{m.label}</th>
                        ))}
                        <th className="text-right py-2 font-bold min-w-22.5 bg-muted/50">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-1.5 font-medium sticky left-0 bg-card z-10">CA HT</td>
                        {first12.map(m => (
                          <td key={m.month} className="text-right py-1.5 text-emerald-600 tabular-nums">
                            {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(m.revenue)}
                          </td>
                        ))}
                        <td className="text-right py-1.5 font-bold bg-muted/50 tabular-nums">
                          {formatCurrency(yearly[0].revenue, c)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-muted-foreground sticky left-0 bg-card z-10">Charges var.</td>
                        {first12.map(m => (
                          <td key={m.month} className="text-right py-1.5 text-red-400 tabular-nums">
                            {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(-m.variableCosts)}
                          </td>
                        ))}
                        <td className="text-right py-1.5 font-medium bg-muted/50 text-red-500 tabular-nums">
                          {formatCurrency(-yearly[0].variableCosts, c)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-medium sticky left-0 bg-card z-10">Marge brute</td>
                        {first12.map(m => (
                          <td key={m.month} className="text-right py-1.5 tabular-nums">
                            {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(m.grossMargin)}
                          </td>
                        ))}
                        <td className="text-right py-1.5 font-bold bg-muted/50 tabular-nums">
                          {formatCurrency(yearly[0].grossMargin, c)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-muted-foreground sticky left-0 bg-card z-10">Charges fixes</td>
                        {first12.map(m => (
                          <td key={m.month} className="text-right py-1.5 text-red-400 tabular-nums">
                            {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(-m.fixedCosts)}
                          </td>
                        ))}
                        <td className="text-right py-1.5 font-medium bg-muted/50 text-red-500 tabular-nums">
                          {formatCurrency(-yearly[0].fixedCosts, c)}
                        </td>
                      </tr>
                      <tr className="border-t-2 border-primary/20">
                        <td className="py-1.5 font-bold sticky left-0 bg-card z-10">Résultat net</td>
                        {first12.map(m => (
                          <td key={m.month} className={`text-right py-1.5 font-semibold tabular-nums ${m.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(m.netIncome)}
                          </td>
                        ))}
                        <td className={`text-right py-1.5 font-bold bg-muted/50 tabular-nums ${yearly[0].netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatCurrency(yearly[0].netIncome, c)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ============= CASHFLOW ============= */}
          {activeSection === 'cashflow' && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Tableau de Trésorerie Mensuel — Année 1
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Suivi de la position de trésorerie cumulée
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MiniBarChart
                    data={first12.map(m => m.cumulativeCashflow)}
                    maxVal={maxCashflow}
                    color="bg-blue-500"
                  />
                  <div className="flex justify-between mt-2">
                    {first12.map(m => (
                      <span key={m.month} className="text-[9px] text-muted-foreground">{m.label}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Détail Trésorerie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium text-muted-foreground sticky left-0 bg-card z-10">Mois</th>
                          {first12.map(m => (
                            <th key={m.month} className="text-right py-2 font-medium min-w-20">{m.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="py-1.5 font-medium sticky left-0 bg-card z-10">Encaissements</td>
                          {first12.map(m => (
                            <td key={m.month} className="text-right py-1.5 text-emerald-600 tabular-nums">
                              {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(m.revenue)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-1.5 text-muted-foreground sticky left-0 bg-card z-10">Décaissements</td>
                          {first12.map(m => (
                            <td key={m.month} className="text-right py-1.5 text-red-400 tabular-nums">
                              {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(-m.totalCosts)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-1.5 font-medium sticky left-0 bg-card z-10">Flux mensuel</td>
                          {first12.map(m => (
                            <td key={m.month} className={`text-right py-1.5 font-medium tabular-nums ${m.cashflow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(m.cashflow)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t-2 border-blue-200 dark:border-blue-800">
                          <td className="py-1.5 font-bold sticky left-0 bg-card z-10">Trésorerie cumulée</td>
                          {first12.map(m => (
                            <td key={m.month} className={`text-right py-1.5 font-bold tabular-nums ${m.cumulativeCashflow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                              {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(m.cumulativeCashflow)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Alert if cash goes negative */}
              {first12.some(m => m.cumulativeCashflow < 0) && (
                <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                  <CardContent className="py-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">⚠️ Risque de rupture de trésorerie</p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Votre trésorerie passe en négatif au cours de l'année 1. 
                        Augmentez votre apport initial, négociez de meilleurs délais fournisseurs, 
                        ou réduisez vos charges fixes pour sécuriser votre runway.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* ============= BFR & FUNDING ============= */}
          {activeSection === 'bfr' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BFR Breakdown */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      ⏳ Besoin en Fonds de Roulement (BFR)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Calcul basé sur les délais de paiement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Créances clients ({inputs.clientPaymentDays}j)</span>
                        <span className="text-xs font-semibold text-amber-600">+{formatCurrency(results.clientReceivables, c)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Stock ({inputs.stockDays}j)</span>
                        <span className="text-xs font-semibold text-amber-600">+{formatCurrency(results.stockValue, c)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Dettes fournisseurs ({inputs.supplierPaymentDays}j)</span>
                        <span className="text-xs font-semibold text-emerald-600">-{formatCurrency(results.supplierPayables, c)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">BFR</span>
                        <span className={`text-sm font-bold ${bfr > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {formatCurrency(bfr, c)}
                        </span>
                      </div>
                    </div>
                    {bfr > 0 && (
                      <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
                        💡 <strong>Conseil :</strong> Négociez des délais fournisseurs plus longs ou 
                        réduisez votre stock pour minimiser le BFR.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Funding Plan */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      🏦 Plan de Financement Initial
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">BESOINS</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Trésorerie initiale (3 mois de charges fixes)</span>
                        <span className="text-xs font-semibold">{formatCurrency(results.totalFixedCosts * 3, c)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">BFR</span>
                        <span className="text-xs font-semibold">{formatCurrency(bfr, c)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold">Total besoins</span>
                        <span className="text-xs font-bold">{formatCurrency(totalFundingNeeded, c)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground mt-3">RESSOURCES</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Apport personnel</span>
                        <span className="text-xs font-semibold text-emerald-600">{formatCurrency(inputs.initialInvestment, c)}</span>
                      </div>
                      {inputs.loanAmount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Emprunt bancaire</span>
                          <span className="text-xs font-semibold text-blue-600">{formatCurrency(inputs.loanAmount, c)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold">Total ressources</span>
                        <span className="text-xs font-bold text-emerald-600">
                          {formatCurrency(inputs.initialInvestment + inputs.loanAmount, c)}
                        </span>
                      </div>
                    </div>

                    {fundingGap > 0 ? (
                      <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-red-700 dark:text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Gap de financement
                        </p>
                        <p className="text-lg font-bold text-red-600 mt-1">{formatCurrency(fundingGap, c)}</p>
                        <p className="text-xs text-red-500 mt-1">
                          Montant supplémentaire à trouver (subvention, investisseurs, love money...)
                        </p>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Financement couvert
                        </p>
                        <p className="text-xs text-emerald-500 mt-1">
                          Vos ressources couvrent les besoins initiaux.
                        </p>
                      </div>
                    )}

                    {inputs.loanAmount > 0 && (
                      <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded-lg">
                        📋 Mensualité d'emprunt : <strong>{formatCurrency(results.monthlyLoanPayment, c)}</strong> /mois
                        pendant {inputs.loanDurationMonths} mois ({formatPercent(inputs.loanInterestRate)}/an)
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
