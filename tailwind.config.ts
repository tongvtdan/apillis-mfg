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
					light: 'hsl(var(--primary-light))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
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
					foreground: 'hsl(var(--warning-foreground))',
					light: 'hsl(var(--warning-light))'
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
				"factory-pulse-light": {
					"primary": "#03DAC6",          // Teal/Cyan - main brand color
					"primary-content": "#000000",  // primary-content: #000000
					"secondary": "#BB86FC",        // Purple - secondary actions
					"secondary-content": "#FFFFFF", // secondary-content: #FFFFFF
					"accent": "#FFD740",           // Amber - warnings and highlights
					"accent-content": "#1F2937",   // accent-content: #1F2937
					"neutral": "#1F2937",          // Dark slate - base elements
					"neutral-content": "#FFFFFF",  // neutral-content: #FFFFFF
					"base-100": "#FFFFFF",         // White - light mode background
					"base-200": "#F9FAFB",         // Light gray - secondary backgrounds
					"base-300": "#D1D5DB",         // Medium gray - borders and dividers (5% darker)
					"base-content": "#1F2937",     // Dark text
					"info": "#2196F3",             // Blue - informational elements
					"success": "#4CAF50",          // Green - success states
					"warning": "#FB8C00",          // Orange - warnings
					"error": "#CF6679",            // Pink-red - errors and critical items

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
			{
				"factory-pulse-dark": {
					"primary": "#03DAC6",          // Teal/Cyan - same in dark
					"primary-content": "#000000",  // primary-content: #000000
					"secondary": "#BB86FC",        // Purple - same in dark
					"secondary-content": "#FFFFFF", // secondary-content: #FFFFFF
					"accent": "#FFD740",           // Amber - same in dark
					"accent-content": "#1F2937",   // accent-content: #1F2937
					"neutral": "#1E1E1E",          // Dark neutral
					"neutral-content": "#E0E0E0",  // Light neutral content
					"base-100": "#121212",         // Dark base
					"base-200": "#1E1E1E",         // Dark secondary
					"base-300": "#5A5A5A",         // Dark tertiary - Further lightened for better visibility
					"base-content": "#E0E0E0",     // Light text
					"info": "#2196F3",             // Blue - same in dark
					"success": "#4CAF50",          // Green - same in dark
					"warning": "#FB8C00",          // Orange - same in dark
					"error": "#CF6679",            // Pink-red - same in dark

					// Additional custom properties
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
		darkTheme: "factory-pulse-dark",
		base: true,
		styled: true,
		utils: true,
		prefix: "",
		logs: true,
		themeRoot: "html", // Changed from :root to html to ensure proper theme application
	},
} satisfies Config;
