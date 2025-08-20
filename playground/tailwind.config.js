/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        './index.html',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: '#0ea5e9',
                    dark: '#0284c7',
                },
            },
        },
    },
    plugins: [],
}

export default config


