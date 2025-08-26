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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))',
					light: 'hsl(var(--primary-light))',
					'50': '#F0F9FF',
					'100': '#E0F2FE',
					'200': '#BAE6FD',
					'300': '#7DD3FC',
					'400': '#38BDF8',
					'500': '#0EA5E9',
					'600': '#0284C7',
					'700': '#0369A1',
					'800': '#075985',
					'900': '#0C4A6E',
					'950': '#082F49'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					'50': '#F0F9FF',
					'100': '#E0F2FE',
					'200': '#BAE6FD',
					'300': '#7DD3FC',
					'400': '#38BDF8',
					'500': '#0EA5E9',
					'600': '#0284C7',
					'700': '#0369A1',
					'800': '#075985',
					'900': '#0C4A6E',
					'950': '#082F49'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
					light: 'hsl(var(--destructive-light))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					light: 'hsl(var(--success-light))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				status: {
					inquiry: 'hsl(var(--status-inquiry))',
					review: 'hsl(var(--status-review))',
					quote: 'hsl(var(--status-quote))',
					production: 'hsl(var(--status-production))',
					completed: 'hsl(var(--status-completed))'
				}
			},
			borderRadius: {
				lg: '1rem',      /* 16px - for cards */
				md: '0.5rem',    /* 8px - for buttons and inputs */
				sm: '0.375rem'   /* 6px - for small elements */
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(10px)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'bounce-subtle': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-2px)'
					}
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
				"factory-pulse-adaptive": {
					// Neutral base that adapts to environment
					"background": "#F8F9FA",       // Light neutral background
					"foreground": "#212529",       // High contrast text
					"card": "#FFFFFF",             // Pure white cards for clarity
					"card-foreground": "#212529",  // Dark text on cards
					"popover": "#FFFFFF",          // Pure white popovers
					"popover-foreground": "#212529", // Dark text in popovers

					// Industry-standard accent colors
					"primary": "#0066CC",          // Industrial Blue (trusted in manufacturing)
					"primary-content": "#FFFFFF",  // White text on primary
					"secondary": "#BB86FC",        // Purple (brand continuity)
					"secondary-content": "#FFFFFF", // White text on secondary
					"accent": "#FFD740",           // Amber (brand continuity)
					"accent-content": "#1F2937",   // Dark text on accent

					// Status colors - industry-standard for clarity
					"success": "#009966",          // Success Green
					"success-content": "#FFFFFF",  // White text on success
					"warning": "#FF9900",          // Warning Orange
					"warning-content": "#FFFFFF",  // White text on warning
					"error": "#CC0033",            // Error Red
					"error-content": "#FFFFFF",    // White text on error
					"info": "#2196F3",             // Info Blue (brand continuity)
					"info-content": "#FFFFFF",     // White text on info

					// Neutral colors for borders and muted elements
					"neutral": "#1F2937",          // Dark slate for base elements
					"neutral-content": "#FFFFFF",  // White text on neutral
					"base-100": "#F8F9FA",         // Light background
					"base-200": "#EBEEF1",         // Light muted background
					"base-300": "#D8DFE6",         // Subtle borders
					"base-content": "#212529",     // Dark text

					// Additional custom properties
					"--rounded-box": "1rem",       // border radius rounded-box utility class, used in card and other large boxes
					"--rounded-btn": "0.5rem",     // border radius rounded-btn utility class, used in buttons and similar element
					"--rounded-badge": "1.9rem",   // border radius rounded-badge utility class, used in badges and similar
					"--animation-btn": "0.25s",    // duration of animation when you click on button
					"--animation-input": "0.2s",   // duration of animation for inputs like checkbox, toggle, radio, etc
					"--btn-focus-scale": "0.95",   // scale transform of button when you focus on it
					"--border-btn": "1px",         // border width of buttons
					"--tab-border": "1px",         // border width of tabs
					"--tab-radius": "0.5rem",      // border radius of tabs
				},
			},
		],
		darkTheme: "factory-pulse-adaptive", // Uses the same theme but adapts via CSS
		base: true,
		styled: true,
		utils: true,
		prefix: "",
		logs: true,
		themeRoot: "html",
	},
} satisfies Config;