/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				hm: {
					blue: '#127289',   /* Updated Brand Color */
					teal: '#127289',   /* Consolidated to Brand Color */
					dark: '#1F2C3D',
				}
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			}
		},
	},
	plugins: [],
}