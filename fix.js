const fs = require('fs');

// Fix globals.css
let css = fs.readFileSync('app/globals.css', 'utf8');
css = css.replace(/--spacing-(sm|md|base|xs|lg|xl|gutter|container-max):[^;]+;\n/g, '');

const fontCSS = `
@utility text-headline-xl { font-size: 48px; line-height: 1.2; letter-spacing: -0.02em; font-weight: 700; }
@utility text-headline-lg { font-size: 32px; line-height: 1.25; font-weight: 700; }
@utility text-headline-md { font-size: 24px; line-height: 1.3; font-weight: 600; }
@utility text-body-lg { font-size: 18px; line-height: 1.6; font-weight: 400; }
@utility text-body-md { font-size: 16px; line-height: 1.5; font-weight: 400; }
@utility text-body-sm { font-size: 14px; line-height: 1.5; font-weight: 400; }
@utility text-label-md { font-size: 14px; line-height: 1; letter-spacing: 0.05em; font-weight: 600; }
@utility text-currency-display { font-size: 20px; line-height: 1; font-weight: 600; }
`;

if (!css.includes('@utility text-headline-xl')) {
  css = fontCSS + '\n' + css;
}
fs.writeFileSync('app/globals.css', css);

// Fix page.tsx spacing classes
let page = fs.readFileSync('app/(public)/page.tsx', 'utf8');
const classMap = {
  'gap-xs': 'gap-1', 'gap-sm': 'gap-3', 'gap-md': 'gap-6', 'gap-lg': 'gap-12', 'gap-xl': 'gap-20',
  'px-xs': 'px-1', 'px-sm': 'px-3', 'px-md': 'px-6', 'px-lg': 'px-12', 'px-xl': 'px-20', 'px-gutter': 'px-6',
  'py-xs': 'py-1', 'py-sm': 'py-3', 'py-md': 'py-6', 'py-lg': 'py-12', 'py-xl': 'py-20',
  'pt-xs': 'pt-1', 'pt-sm': 'pt-3', 'pt-md': 'pt-6', 'pt-lg': 'pt-12', 'pt-xl': 'pt-20',
  'pb-xs': 'pb-1', 'pb-sm': 'pb-3', 'pb-md': 'pb-6', 'pb-lg': 'pb-12', 'pb-xl': 'pb-20',
  'mt-xs': 'mt-1', 'mt-sm': 'mt-3', 'mt-md': 'mt-6', 'mt-lg': 'mt-12', 'mt-xl': 'mt-20',
  'mb-xs': 'mb-1', 'mb-sm': 'mb-3', 'mb-md': 'mb-6', 'mb-lg': 'mb-12', 'mb-xl': 'mb-20',
  'right-md': 'right-6', 'max-w-container-max': 'max-w-7xl'
};

Object.entries(classMap).forEach(([oldClass, newClass]) => {
  const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
  page = page.replace(regex, newClass);
});

fs.writeFileSync('app/(public)/page.tsx', page);
console.log('Fixed CSS and JSX spacing.');
