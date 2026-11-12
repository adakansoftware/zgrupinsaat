type DatabaseConnectionInput = {
  databaseUrl: string
  hyperdriveConnectionString?: string
}

export function resolveDatabaseConnection({
  databaseUrl,
  hyperdriveConnectionString,
}: DatabaseConnectionInput) {
  if (hyperdriveConnectionString) {
    return {
      connectionString: hyperdriveConnectionString,
      maxUses: 1,
    }
  }

  return { connectionString: databaseUrl }
}
