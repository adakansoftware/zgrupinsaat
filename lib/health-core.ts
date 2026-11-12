export function isHealthReady(input: {
  contentStore: 'file' | 'postgres'
  dataReady: boolean
  databaseReady: boolean
}) {
  return input.contentStore === 'postgres' ? input.databaseReady : input.dataReady
}
