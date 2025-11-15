/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./widgets/**/*.{html,js}",
    "./index.html"
  ],
  theme: {
    extend: {
      // Paleta de colores temática de radio
      colors: {
        // Colores principales
        'radio-red': '#FF3B3B',        // Rojo FM - Display digital, ON AIR
        'radio-gold': '#FFD700',       // Oro vintage - Edad dorada de radio
        'radio-charcoal': '#2C2C2C',   // Carbón - Micrófonos clásicos
        'radio-silver': '#C0C0C0',     // Plata - Equipos metálicos
        'radio-wave': '#00D9FF',       // Cyan neón - Ondas sonoras modernas

        // Tonos de apoyo
        'radio-amber': '#FFBF00',      // Ámbar - Luces de estudio
        'radio-slate': '#4A4A4A',      // Pizarra oscura - Fondos
        'radio-cream': '#F5F5DC',      // Crema - Detalles suaves

        // Variantes de intensidad
        'radio-red-dark': '#CC2F2F',
        'radio-red-light': '#FF6B6B',
        'radio-gold-dark': '#CCB300',
        'radio-gold-light': '#FFE55C',
        'radio-wave-dark': '#00AECC',
        'radio-wave-light': '#5CEDFF',
      },

      // Tipografía Poppins
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'sans': ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      // Tamaños de fuente optimizados para 9:16 (vertical)
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px
        '8xl': ['6rem', { lineHeight: '1' }],           // 96px
        '9xl': ['8rem', { lineHeight: '1' }],           // 128px
      },

      // Espaciado específico para layout 9:16
      spacing: {
        'safe-top': '80px',     // Safe zone superior (UI de TikTok)
        'safe-bottom': '120px', // Safe zone inferior (controles de TikTok)
        'safe-side': '20px',    // Safe zone lateral
      },

      // Animaciones personalizadas
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor',
          },
          '50%': {
            boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
          },
        },
      },

      // Sombras personalizadas
      boxShadow: {
        'glow-red': '0 0 10px #FF3B3B, 0 0 20px #FF3B3B',
        'glow-gold': '0 0 10px #FFD700, 0 0 20px #FFD700',
        'glow-wave': '0 0 10px #00D9FF, 0 0 20px #00D9FF',
        'radio': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
