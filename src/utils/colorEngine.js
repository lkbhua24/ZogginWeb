const COLOR_PALETTES = {
  warm: [
    '#F0EEDA', '#F0EADF', '#EAE3B2', '#F3DC9C', '#F4E9E7',
    '#F5E4E5', '#F9D7D2', '#F5C6C4', '#F8B1B1'
  ],
  cool: [
    '#87DFE4', '#C3DAE6', '#B1D6E6', '#9DCCE1', '#DFF0EF',
    '#CAE4E3', '#E3E3EF', '#ECDAEA', '#EBC8E1'
  ],
  nature: [
    '#DAE6DB', '#D7E6D3', '#B8D4B7', '#DEEDDD', '#E4EACA',
    '#DCE7E4', '#EADEE6', '#E4D1E6', '#F0E6E1'
  ]
};

const THEME_NAMES = {
  warm: '今日晨曦',
  cool: '今日深海',
  nature: '今日森林'
};

export function getDailySeed() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return year * 10000 + month * 100 + day;
}

export function selectBySeed(array, seed, count) {
  const result = [];
  const available = [...array];
  let s = seed;

  const lcg = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  for (let i = 0; i < count && available.length > 0; i++) {
    const randomValue = lcg();
    const index = Math.floor(randomValue * available.length);
    result.push(available[index]);
    available.splice(index, 1);
  }

  return result;
}

export function generateTodayPalette() {
  const seed = getDailySeed();
  const themeKeys = ['warm', 'cool', 'nature'];
  const primaryThemeIndex = seed % 3;
  const primaryTheme = themeKeys[primaryThemeIndex];

  const otherThemes = themeKeys.filter((_, i) => i !== primaryThemeIndex);

  const primaryColors = selectBySeed(COLOR_PALETTES[primaryTheme], seed, 3);
  const accent1 = selectBySeed(COLOR_PALETTES[otherThemes[0]], seed + 1, 1)[0];
  const accent2 = selectBySeed(COLOR_PALETTES[otherThemes[1]], seed + 2, 1)[0];

  return {
    base: primaryColors[0],
    mid: primaryColors[1],
    highlight: primaryColors[2],
    accent1,
    accent2,
    themeName: primaryTheme,
    seed
  };
}

export function generateGradient(palette) {
  const { base, mid, highlight, accent1, accent2 } = palette;

  const layers = [];

  layers.push(`linear-gradient(160deg, ${base} 0%, ${mid} 50%, ${highlight} 100%)`);

  const highlightRgba = hexToRgba(highlight, 0.4);
  layers.push(`radial-gradient(circle at 20% 30%, ${highlightRgba} 0%, transparent 50%)`);

  const midRgba = hexToRgba(mid, 0.6);
  layers.push(`radial-gradient(circle at 80% 70%, ${midRgba} 0%, transparent 40%)`);

  if (accent1) {
    const accent1Rgba = hexToRgba(accent1, 0.15);
    layers.push(`radial-gradient(circle at 50% 50%, ${accent1Rgba} 0%, transparent 60%)`);
  }

  if (accent2) {
    const accent2Rgba = hexToRgba(accent2, 0.15);
    layers.push(`radial-gradient(circle at 30% 80%, ${accent2Rgba} 0%, transparent 50%)`);
  }

  return layers.join(', ');
}

export function getThemeDisplayName(themeName) {
  return THEME_NAMES[themeName] || '未知主题';
}

export function isLightColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;

  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq > 128;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

function hexToRgba(hex, alpha) {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export const palettes = COLOR_PALETTES;

// 莫兰迪色系 - 护眼模式专用（低饱和度、柔和色调）
const MORANDI_COLORS = {
  // 灰粉色系
  pink: ['#D4C4C4', '#C9B8B8', '#D8C8C5', '#CFC5C2', '#D9CCC8'],
  // 灰蓝色系
  blue: ['#B8C4CE', '#A8B8C4', '#C4D0D8', '#B0C0CC', '#C8D4DC'],
  // 灰绿色系
  green: ['#C4CEC4', '#B8C8B8', '#D0D8CC', '#C2CCC2', '#D4DCD0'],
  // 米黄色系
  beige: ['#E8E0D4', '#DED6C8', '#E4DCD0', '#DDD4C8', '#E2DAD0'],
  // 灰紫色系
  purple: ['#C8C0C8', '#BCB4BC', '#D4CCD4', '#C4BCC4', '#D8D0D8'],
  // 暖灰色系
  warmGray: ['#D4D0CC', '#C8C4C0', '#DDD8D4', '#D0CCC8', '#E2DED8'],
  // 冷灰色系
  coolGray: ['#C8CCD0', '#BCC0C4', '#D4D8DC', '#CCD0D4', '#D8DCDE']
};

/**
 * 生成莫兰迪色系调色板 - 护眼模式专用
 * @returns {Object} 低饱和度的柔和色彩调色板
 */
export function generateMorandiPalette() {
  const seed = getDailySeed();
  const morandiKeys = Object.keys(MORANDI_COLORS);

  // 每天轮换主色调
  const primaryIndex = seed % morandiKeys.length;
  const secondaryIndex = (seed + 2) % morandiKeys.length;
  const tertiaryIndex = (seed + 4) % morandiKeys.length;

  const primary = MORANDI_COLORS[morandiKeys[primaryIndex]];
  const secondary = MORANDI_COLORS[morandiKeys[secondaryIndex]];
  const tertiary = MORANDI_COLORS[morandiKeys[tertiaryIndex]];

  // 选择柔和的色彩组合
  return {
    base: primary[0],           // 主背景色
    mid: primary[1],            // 中间过渡色
    highlight: primary[2],      // 高亮色
    accent1: secondary[0],      // 点缀色1
    accent2: tertiary[0],       // 点缀色2
    themeName: 'morandi',
    seed
  };
}

/**
 * 生成深色模式调色板
 * @returns {Object} 深色主题色彩
 */
export function generateDarkPalette() {
  const seed = getDailySeed();

  // 深色模式的配色 - 低亮度但保持一定饱和度
  const darkBase = [
    '#1A1A2E', '#16213E', '#0F3460', '#1F2937', '#111827',
    '#1E1B4B', '#312E81', '#1E293B', '#0F172A', '#1A1F2E'
  ];

  const darkAccent = [
    '#4C4C8C', '#4A5568', '#4B5563', '#52525B', '#525B75',
    '#5C5C8C', '#6366F1', '#8B5CF6', '#A855F7', '#6366F1'
  ];

  const primary = selectBySeed(darkBase, seed, 3);
  const accent = selectBySeed(darkAccent, seed + 1, 2);

  return {
    base: primary[0],
    mid: primary[1],
    highlight: primary[2],
    accent1: accent[0],
    accent2: accent[1],
    themeName: 'dark',
    seed
  };
}

/**
 * 根据当前主题获取对应的调色板
 * @param {string} theme - 主题名称: 'light', 'dark', 'eye-care'
 * @returns {Object} 对应的调色板
 */
export function getPaletteByTheme(theme) {
  switch (theme) {
    case 'dark':
      return generateDarkPalette();
    case 'eye-care':
      return generateMorandiPalette();
    case 'light':
    default:
      return generateTodayPalette();
  }
}
