<template>
  <div class="study-background">
    <div class="gradient-layer" :style="gradientStyle"></div>

    <div
      v-if="animated"
      class="pattern-layer"
      :class="currentPattern"
    >
      <FogPattern v-if="currentPattern === 'fog'" :color="palette.mid" />
      <BreathPattern v-if="currentPattern === 'breath'" :color="palette.highlight" />
      <AuroraPattern v-if="currentPattern === 'aurora'" :color="palette.base" />
      <ParticlesPattern v-if="currentPattern === 'particles'" :color="palette.mid" :paused="isPaused" />
      <RipplePattern v-if="currentPattern === 'ripple'" :color="palette.base" />
      <TexturePattern v-if="currentPattern === 'texture'" :color="palette.mid" />
    </div>

    <div class="content-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { generateTodayPalette, generateGradient } from '@/utils/colorEngine.js';

const PATTERN_TYPES = ['fog', 'breath', 'aurora', 'particles', 'ripple', 'texture'];

const FogPattern = {
  name: 'FogPattern',
  props: ['color'],
  template: `
    <svg class="fog-pattern" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <filter id="fog-blur">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <ellipse
        cx="30" cy="50" rx="40" ry="30"
        :fill="color"
        filter="url(#fog-blur)"
        class="fog-ellipse fog-1"
      />
      <ellipse
        cx="70" cy="40" rx="35" ry="25"
        :fill="color"
        filter="url(#fog-blur)"
        class="fog-ellipse fog-2"
      />
      <ellipse
        cx="50" cy="70" rx="45" ry="20"
        :fill="color"
        filter="url(#fog-blur)"
        class="fog-ellipse fog-3"
      />
    </svg>
  `
};

const BreathPattern = {
  name: 'BreathPattern',
  props: ['color'],
  template: `
    <div class="breath-pattern">
      <div class="breath-circle" :style="{ background: radialGradient }"></div>
    </div>
  `,
  computed: {
    radialGradient() {
      return `radial-gradient(circle, ${this.color} 0%, transparent 70%)`;
    }
  }
};

const AuroraPattern = {
  name: 'AuroraPattern',
  props: ['color'],
  template: `
    <svg class="aurora-pattern" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <filter id="aurora-turbulence">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" />
        </filter>
      </defs>
      <path
        d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z"
        :fill="color"
        filter="url(#aurora-turbulence)"
        class="aurora-path"
      />
    </svg>
  `
};

const ParticlesPattern = {
  name: 'ParticlesPattern',
  props: ['color', 'paused'],
  data() {
    return {
      particles: [],
      animationId: null
    };
  },
  mounted() {
    this.initParticles();
    if (!this.paused) {
      this.startAnimation();
    }
  },
  beforeUnmount() {
    this.stopAnimation();
  },
  watch: {
    paused(val) {
      if (val) {
        this.stopAnimation();
      } else {
        this.startAnimation();
      }
    }
  },
  methods: {
    initParticles() {
      this.particles = [];
      for (let i = 0; i < 50; i++) {
        this.particles.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 1
        });
      }
    },
    startAnimation() {
      if (this.animationId) return;
      const animate = () => {
        this.updateParticles();
        this.drawCanvas();
        this.animationId = requestAnimationFrame(animate);
      };
      animate();
    },
    stopAnimation() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    },
    updateParticles() {
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 100) p.vx *= -1;
        if (p.y < 0 || p.y > 100) p.vy *= -1;
      });
    },
    drawCanvas() {
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const rgb = this.hexToRgb(this.color);
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;

      this.particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x * w / 100, p.y * h / 100, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 10) {
            ctx.beginPath();
            ctx.moveTo(this.particles[i].x * w / 100, this.particles[i].y * h / 100);
            ctx.lineTo(this.particles[j].x * w / 100, this.particles[j].y * h / 100);
            ctx.stroke();
          }
        }
      }
    },
    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
        : { r: 200, g: 200, b: 200 };
    }
  },
  template: `
    <canvas ref="canvas" class="particles-canvas" width="800" height="600"></canvas>
  `
};

const RipplePattern = {
  name: 'RipplePattern',
  props: ['color'],
  data() {
    return {
      ripples: [],
      nextId: 0,
      intervalId: null
    };
  },
  mounted() {
    this.spawnRipple();
    this.intervalId = setInterval(() => {
      this.spawnRipple();
    }, 4000);
  },
  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },
  methods: {
    spawnRipple() {
      const id = this.nextId++;
      const x = Math.random() * 80 + 10;
      const y = Math.random() * 80 + 10;
      this.ripples.push({ id, x, y });
      setTimeout(() => {
        this.ripples = this.ripples.filter(r => r.id !== id);
      }, 4000);
    }
  },
  template: `
    <div class="ripple-pattern">
      <div
        v-for="ripple in ripples"
        :key="ripple.id"
        class="ripple-ring"
        :style="{
          left: ripple.x + '%',
          top: ripple.y + '%',
          borderColor: color
        }"
      ></div>
    </div>
  `
};

const TexturePattern = {
  name: 'TexturePattern',
  props: ['color'],
  template: `
    <svg class="texture-pattern" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <filter id="texture-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect
        width="100" height="100"
        :fill="color"
        filter="url(#texture-noise)"
        class="texture-rect"
      />
    </svg>
  `
};

export default {
  name: 'StudyBackground',
  components: {
    FogPattern,
    BreathPattern,
    AuroraPattern,
    ParticlesPattern,
    RipplePattern,
    TexturePattern
  },
  props: {
    animated: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      palette: {
        base: '#667eea',
        mid: '#764ba2',
        highlight: '#f093fb',
        accent1: '#4facfe',
        accent2: '#43e97b',
        themeName: 'default',
        seed: 0
      },
      currentPattern: 'particles',
      isPaused: false,
      refreshTimer: null
    };
  },
  computed: {
    gradientStyle() {
      return {
        background: generateGradient(this.palette)
      };
    },
    todayPatternName() {
      const index = this.palette.seed % 6;
      return PATTERN_TYPES[index];
    }
  },
  mounted() {
    this.refresh();

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow - now;

    this.refreshTimer = setTimeout(() => {
      this.refresh();
    }, msUntilMidnight);

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  },
  beforeUnmount() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  },
  methods: {
    refresh() {
      this.palette = generateTodayPalette();
      this.currentPattern = this.todayPatternName;
    },
    handleVisibilityChange() {
      this.isPaused = document.hidden;
    }
  }
};
</script>

<style scoped>
.study-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.gradient-layer {
  position: absolute;
  inset: 0;
  transition: background 1s ease;
  will-change: transform;
}

.pattern-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  will-change: transform;
}

.pattern-layer.fog {
  opacity: 0.8;
}

.pattern-layer.breath {
  opacity: 0.9;
}

.pattern-layer.aurora {
  opacity: 0.8;
}

.pattern-layer.particles {
  opacity: 1;
}

.pattern-layer.ripple {
  opacity: 0.9;
}

.pattern-layer.texture {
  opacity: 0.6;
}

.content-wrapper {
  position: relative;
  z-index: 10;
  height: 100vh;
  overflow: auto;
}

.fog-pattern {
  width: 100%;
  height: 100%;
}

.fog-ellipse {
  opacity: 0.8;
  will-change: transform;
}

.fog-1 {
  animation: fog-drift-1 20s ease-in-out infinite;
}

.fog-2 {
  animation: fog-drift-2 25s ease-in-out infinite;
}

.fog-3 {
  animation: fog-drift-3 22s ease-in-out infinite;
}

@keyframes fog-drift-1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, 10px); }
}

@keyframes fog-drift-2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-15px, 15px); }
}

@keyframes fog-drift-3 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(10px, -10px); }
}

.breath-pattern {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.breath-circle {
  width: 60%;
  height: 60%;
  border-radius: 50%;
  animation: breath-pulse 8s ease-in-out infinite;
  will-change: transform, opacity;
}

@keyframes breath-pulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.9;
  }
}

.aurora-pattern {
  width: 100%;
  height: 100%;
}

.aurora-path {
  opacity: 0.7;
  animation: aurora-wave 15s ease-in-out infinite;
  will-change: transform;
}

@keyframes aurora-wave {
  0%, 100% {
    transform: translateY(0) scaleY(1);
  }
  25% {
    transform: translateY(-5%) scaleY(1.1);
  }
  50% {
    transform: translateY(5%) scaleY(0.9);
  }
  75% {
    transform: translateY(-3%) scaleY(1.05);
  }
}

.particles-canvas {
  width: 100%;
  height: 100%;
}

.ripple-pattern {
  width: 100%;
  height: 100%;
  position: relative;
}

.ripple-ring {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 3px solid;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple-expand 4s ease-out forwards;
  will-change: transform, opacity;
}

@keyframes ripple-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}

.texture-pattern {
  width: 100%;
  height: 100%;
}

.texture-rect {
  mix-blend-mode: overlay;
}
</style>
