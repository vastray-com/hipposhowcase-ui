import { defineConfig, presetIcons, presetWind3, transformerVariantGroup } from 'unocss'
import presetAnimations from 'unocss-preset-animations'

export default defineConfig({
  presets: [
    presetWind3({ dark: 'class' }),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'font-size': 'inherit',
        'vertical-align': 'middle',
        'color': 'currentColor',
      },
    }),
    // presetWebFonts({
    //   fonts: {
    //     mono: ['JetBrains Mono', 'JetBrains Mono:400,700'],
    //     sans: ['Cabin', 'Cabin:400,500,600,700'],
    //   },
    //   provider: 'google',
    // }),
    presetAnimations(),
  ],
  transformers: [transformerVariantGroup()],
  shortcuts: {
    'bg-1': 'bg-white',
    'bg-2': 'bg-white1',
    'bg-3': 'bg-white2',

    'text-title': 'text-black1',
    'text-primary': 'text-black2',
    'text-secondary': 'text-black3',
    'text-info': 'text-black4',

    'shadow-1': 'shadow-[1px_2px_2px_0px_#00000026]',
    'shadow-2': 'shadow-[0_4px_4px_0px_#90909040]',

    'rounded-1': 'rounded-[8px]',
    'rounded-2': 'rounded-[16px]',
    'rounded-3': 'rounded-[24px]',

    'btn-solid-black': 'bg-[#444] b-[#444] text-white important:hover:(bg-[#555]  b-[#555] text-white) important:active:(bg-[#333]  b-[#333] text-white) important:disabled:(bg-[#aaa]  b-[#aaa] text-[#ddd])',
    'btn-solid-aux2': 'bg-aux2 b-aux2 text-white important:hover:(bg-[#FFC2B2]  b-[#FFC2B2] text-white) important:active:(bg-[#F5A794]  b-[#F5A794] text-white) important:disabled:(bg-[#FFC2B2]  b-[#FFDFD6] text-white)',
    // 'btn-black': 'bg-[#444] b-[#444] text-white important:hover:(bg-[#444d]  b-[#444d] text-white) important:active:(bg-[#333]  b-[#333] text-white)',
    'btn-solid-gray': 'bg-[#A4A4A4] b-[#A4A4A4] text-white important:hover:(bg-[#B4B4B4]  b-[#B4B4B4] text-white) important:active:(bg-[#939393]  b-[#939393] text-white) important:disabled:(bg-[#939393]  b-[#939393] text-white)',

  },
  theme: {
    colors: {
      white1: '#F8F3ED',
      white2: '#F9F9F9',

      black1: '#121212',
      black2: '#444',
      black3: '#777',
      black4: '#999',

      aux1: '#6C8EBF',
      aux2: '#FFB6A3',
      aux3: '#F0F4F7',
      aux4: '#07BEB8',
      aux5: '#009FFD',
      aux6: '#FFA400',
    },
    zIndex: {
      logo: 99999,
    },
  },
})
