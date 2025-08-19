import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/app/**/*.{ts,tsx}",
		"./src/components/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	theme: {
		extend: {
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: "hsl(var(--card))",
				cardForeground: "hsl(var(--card-foreground))",
				muted: "hsl(var(--muted))",
				mutedForeground: "hsl(var(--muted-foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			boxShadow: {
				sm: "0 1px 2px 0 rgb(0 0 0 / 0.06)",
				md: "0 6px 20px -6px rgb(0 0 0 / 0.12)",
				lg: "0 16px 40px -12px rgb(0 0 0 / 0.18)",
			},
		},
	},
	darkMode: ["class"],
};

export default config;


