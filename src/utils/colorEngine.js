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
