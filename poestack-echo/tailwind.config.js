module.exports = {
    content: [
        './**/*.{js,jsx,ts,tsx}',
        '../poestack-echo-common/src/**/*.{js,jsx,ts,tsx}',
        '../poestack-echo-plugins/**/*.{js,jsx,ts,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                "primary-surface": "var(--color-primary-surface)",
                "secondary-surface": "var(--color-secondary-surface)",
                "primary-text": "var(--color-text)",
            },
        },
    },
    plugins: [],
};