import type { Metadata } from 'next'
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
import { ServiceComparisonSection } from '@/components/service-comparison-section'
import { ServiceDecisionGuide } from '@/components/service-decision-guide'
import { ServicesSection } from '@/components/services-section'
import { SiteComplexitySection } from '@/components/site-complexity-section'
import { SiteFrame } from '@/components/site-frame'
import { ScopeBoundarySection } from '@/components/scope-boundary-section'
import { WhyUsSection } from '@/components/why-us-section'
import { buildShareMetadata, getCanonicalUrl } from '@/lib/seo'
import { getSiteSettings } from '@/lib/settings-service'

export const metadata: Metadata = {
  title: {
    absolute: 'Hafriyat ve İş Makinesi Hizmetleri | Z GRUP İNŞAAT',
  },
  description: 'Hafriyat, temel kazısı, dolgu, damperli nakliyat, lowbed, arazöz, beko loder ve ekskavatör hizmetlerini inceleyin.',
  alternates: {
    canonical: getCanonicalUrl('/services'),
  },
  ...buildShareMetadata({
    title: 'Hafriyat ve İş Makinesi Hizmetleri | Z GRUP İNŞAAT',
    description: 'Hafriyat, temel kazısı, dolgu, damperli nakliyat, lowbed, arazöz, beko loder ve ekskavatör hizmetlerini inceleyin.',
    pathname: '/services',
  }),
}

export default async function ServicesPage() {
  const settings = await getSiteSettings()

  return (
    <SiteFrame settings={settings}>
      <PageHero
        title="Kazıdan sevkiyata sahada işleyen plan"
        description="Temel kazısı, hafriyat nakliyesi, dolgu, damperli nakliyat, lowbed ve arazöz desteğini sahanın erişimine, zemin durumuna, malzeme türüne ve çalışma takvimine göre planlıyoruz."
        image="/images/excavator.jpg"
        primaryCta={{ href: '/projects', label: 'Saha İşlerini İnceleyin' }}
      />
      <ServicesSection />
      <ServiceDecisionGuide />
      <ServiceComparisonSection />
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
      <WhyUsSection />
      <CTASection settings={settings} />
    </SiteFrame>
  )
}
