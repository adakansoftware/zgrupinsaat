import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = [
  ...nextVitals,
  {
    ignores: ['.next/**', '.open-next/**', '.wrangler/**', 'node_modules/**', 'tsconfig.tsbuildinfo'],
  },
]

export default eslintConfig
