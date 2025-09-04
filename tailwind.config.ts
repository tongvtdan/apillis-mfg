import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
				'mono': ['Space Mono', 'monospace'],
			},
			spacing: {
				'18': '4.5rem',   /* 72px */
				'88': '22rem',    /* 352px */
				'128': '32rem',   /* 512px */
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-2px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'bounce-subtle': 'bounce-subtle 0.4s ease-in-out'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require("daisyui")
	],
	daisyui: {
		themes: [
			{
				"factory-pulse": {
					// Teal/Cyan Blue Primary System
					"primary": "#0EA5E9",          // Vibrant Teal/Cyan Blue
					"primary-content": "#FFFFFF",  // White text on primary
					"secondary": "#38BDF8",        // Light Teal
					"secondary-content": "#FFFFFF", // White text on secondary
					"accent": "#7DD3FC",           // Light Teal accent
					"accent-content": "#1F2937",   // Dark text on accent

					// Neutral Base Colors
					"base-100": "#F8F9FA",         // Light neutral background
					"base-200": "#EBEEF1",         // Light muted background
					"base-300": "#D8DFE6",         // Subtle borders
					"base-content": "#212529",     // Dark text

					// Status Colors
					"success": "#059669",          // Success Green
					"success-content": "#FFFFFF",  // White text on success
					"warning": "#D97706",          // Warning Orange
					"warning-content": "#FFFFFF",  // White text on warning
					"error": "#DC2626",            // Error Red
					"error-content": "#FFFFFF",    // White text on error
					"info": "#0EA5E9",             // Info Teal (matches primary)
					"info-content": "#FFFFFF",     // White text on info

					// Neutral Colors
					"neutral": "#1F2937",          // Dark slate
					"neutral-content": "#FFFFFF",  // White text on neutral

					// DaisyUI Properties
					"--rounded-box": "1rem",
					"--rounded-btn": "0.5rem",
					"--rounded-badge": "1.9rem",
					"--animation-btn": "0.25s",
					"--animation-input": "0.2s",
					"--btn-focus-scale": "0.95",
					"--border-btn": "1px",
					"--tab-border": "1px",
					"--tab-radius": "0.5rem",
				},
			},
		],
		darkTheme: "factory-pulse",
		base: true,
		styled: true,
		utils: true,
		prefix: "",
		logs: true,
		themeRoot: "html",
	},
} satisfies Config;