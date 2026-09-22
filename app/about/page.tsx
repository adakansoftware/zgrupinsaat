import type { Metadata } from 'next'
import { AboutSection } from '@/components/about-section'
import { CTASection } from '@/components/cta-section'
import { ControlSignalsSection } from '@/components/control-signals-section'
import { CriticalDependenciesSection } from '@/components/critical-dependencies-section'
import { CostDriversSection } from '@/components/cost-drivers-section'
import { DecisionQualitySection } from '@/components/decision-quality-section'
import { CoordinationTriggersSection } from '@/components/coordination-triggers-section'
import { DelayCausesSection } from '@/components/delay-causes-section'
import { EarlyFailureSignalsSection } from '@/components/early-failure-signals-section'
import { EndOfDayReviewSection } from '@/components/end-of-day-review-section'
import { FalseAssumptionsSection } from '@/components/false-assumptions-section'
import { FieldPriorityMatrixSection } from '@/components/field-priority-matrix-section'
import { FirstDaySuccessSection } from '@/components/first-day-success-section'
import { GoNoGoSection } from '@/components/go-no-go-section'
import { MobilizationReadinessSection } from '@/components/mobilization-readiness-section'
import { OperationsModelSection } from '@/components/operations-model-section'
import { PageHero } from '@/components/page-hero'
import { ProjectKickoffSection } from '@/components/project-kickoff-section'
import { ProjectMaturitySection } from '@/components/project-maturity-section'
import { ProjectReadinessSection } from '@/components/project-readiness-section'
import { QuoteConfidenceSection } from '@/components/quote-confidence-section'
import { RapidAssessmentSection } from '@/components/rapid-assessment-section'
import { RedFlagsSection } from '@/components/red-flags-section'
import { RecoveryPlaybookSection } from '@/components/recovery-playbook-section'
import { RiskControlSection } from '@/components/risk-control-section'
import { ScenarioBreakdownSection } from '@/components/scenario-breakdown-section'
import { ScheduleScenariosSection } from '@/components/schedule-scenarios-section'
import { SiteComplexitySection } from '@/components/site-complexity-section'
import { SiteFrame } from '@/components/site-frame'
import { ScopeBoundarySection } from '@/components/scope-boundary-section'
import { StatsSection } from '@/components/stats-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { buildShareMetadata, getCanonicalUrl } from '@/lib/seo'
import { getSiteSettings } from '@/lib/settings-service'

export const metadata: Metadata = {
  title: {
    absolute: 'Hakkımızda | Z GRUP İNŞAAT',
  },
  description: 'Z GRUP İNŞAAT’ın hafriyat, temel kazısı, dolgu, nakliyat ve iş makinesi hizmetlerindeki saha tecrübesini inceleyin.',
  alternates: {
    canonical: getCanonicalUrl('/about'),
  },
  ...buildShareMetadata({
    title: 'Hakkımızda | Z GRUP İNŞAAT',
    description: 'Z GRUP İNŞAAT’ın hafriyat, temel kazısı, dolgu, nakliyat ve iş makinesi hizmetlerindeki saha tecrübesini inceleyin.',
    pathname: '/about',
  }),
}

export default async function AboutPage() {
  const settings = await getSiteSettings()

  return (
    <SiteFrame settings={settings}>
      <PageHero
        title={`${settings.companyName} saha çalışma disiplini`}
        description="Hafriyat, temel kazısı, dolgu ve damperli nakliyat işlerinde sahayı önceden okuyup makine, kamyon ve sevkiyat planını aynı iş akışında yöneten çalışma düzenimizi inceleyin."
        image="/images/project-2.jpg"
        primaryCta={{ href: '/contact', label: 'Saha İhtiyacını Görüşelim' }}
      />
      <StatsSection />
      <AboutSection settings={settings} />
      <RapidAssessmentSection />
      <DecisionQualitySection />
      <GoNoGoSection />
      <ProjectKickoffSection />
      <QuoteConfidenceSection />
      <RedFlagsSection />
      <FalseAssumptionsSection />
      <ScenarioBreakdownSection />
      <CostDriversSection />
      <ScheduleScenariosSection />
      <SiteComplexitySection />
      <FieldPriorityMatrixSection />
      <MobilizationReadinessSection />
      <FirstDaySuccessSection />
      <ControlSignalsSection />
      <EarlyFailureSignalsSection />
      <RecoveryPlaybookSection />
      <EndOfDayReviewSection />
      <DelayCausesSection />
      <ScopeBoundarySection />
      <CriticalDependenciesSection />
      <OperationsModelSection />
      <CoordinationTriggersSection />
      <RiskControlSection />
      <ProjectReadinessSection />
      <ProjectMaturitySection />
      <TestimonialsSection settings={settings} />
      <CTASection settings={settings} />
    </SiteFrame>
  )
}
