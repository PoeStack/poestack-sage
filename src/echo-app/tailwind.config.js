module.exports = {
  content: [
    './*.{js,jsx,ts,tsx,html}',
    './src/**/*.{js,jsx,ts,tsx}',
    '../poestack-echo-common/src/**/*.{js,jsx,ts,tsx}',
    '../echo-plugin-examples/*/src/**/*.{js,jsx,ts,tsx}',
    '../echo-plugins/*/src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'primary-surface': 'var(--color-primary-surface)',
        'input-surface': 'var(--color-input-surface)',
        'secondary-surface': 'var(--color-secondary-surface)',
        'primary-text': 'var(--color-text)',
        'primary-accent': 'var(--color-primary-accent)'
      }
    }
  },
  plugins: []
}
