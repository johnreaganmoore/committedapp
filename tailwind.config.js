const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './app/views/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js',
    './app/assets/stylesheets/**/*.css',
  ],
  safelist: [
    'transform',
    'transition',
    'transition-transform',
    'duration-200',
    'ease-in-out',
    '-translate-x-full',
    'translate-x-0',
    'lg:translate-x-0',
    'lg:static',
    'lg:inset-0',
    'fixed',
    'z-50',
    'z-40',
    'hidden',
    'lg:hidden',
    'border-l-4',
    'border-blue-500',
    'border-blue-600',
  ],
  corePlugins: {
    transform: true,
    translate: true,
    transitionProperty: true,
    transitionDuration: true,
    transitionTimingFunction: true,
    borderWidth: true,
    borderColor: true,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
