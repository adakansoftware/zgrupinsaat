export function shouldPersistOperationalState(nextPhase: string | undefined) {
  return nextPhase !== 'phase-production-build'
}
