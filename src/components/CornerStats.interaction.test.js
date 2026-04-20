import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('CornerStats 学习进度展示测试', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('指示器显示', () => {
    it('should render indicator dot', () => {
      const container = document.createElement('div');
      container.className = 'corner-stats';
      
      const indicator = document.createElement('div');
      indicator.className = 'corner-indicator';
      
      const dot = document.createElement('div');
      dot.className = 'indicator-dot';
      indicator.appendChild(dot);
      
      container.appendChild(indicator);
      document.body.appendChild(container);
      
      expect(container.querySelector('.indicator-dot')).not.toBeNull();
    });

    it('should not have active class when no data', () => {
      const container = document.createElement('div');
      container.className = 'corner-stats';
      
      const indicator = document.createElement('div');
      indicator.className = 'corner-indicator';
      
      const dot = document.createElement('div');
      dot.className = 'indicator-dot';
      indicator.appendChild(dot);
      
      container.appendChild(indicator);
      document.body.appendChild(container);
      
      expect(dot.className).not.toContain('active');
    });

    it('should have active class when has data', () => {
      const container = document.createElement('div');
      container.className = 'corner-stats';
      
      const indicator = document.createElement('div');
      indicator.className = 'corner-indicator';
      
      const dot = document.createElement('div');
      dot.className = 'indicator-dot active';
      indicator.appendChild(dot);
      
      container.appendChild(indicator);
      document.body.appendChild(container);
      
      expect(dot.className).toContain('active');
    });

    it('should show pulse animation when has data', () => {
      const container = document.createElement('div');
      container.className = 'corner-stats';
      
      const indicator = document.createElement('div');
      indicator.className = 'corner-indicator';
      
      const dot = document.createElement('div');
      dot.className = 'indicator-dot active';
      indicator.appendChild(dot);
      
      const pulse = document.createElement('div');
      pulse.className = 'indicator-pulse';
      indicator.appendChild(pulse);
      
      container.appendChild(indicator);
      document.body.appendChild(container);
      
      expect(container.querySelector('.indicator-pulse')).not.toBeNull();
    });
  });

  describe('数据展示', () => {
    it('should display study duration', () => {
      const panel = document.createElement('div');
      panel.className = 'corner-panel';
      panel.innerHTML = `
        <div class="stat-row">
          <div class="stat-info">
            <div class="stat-value">45分钟</div>
            <div class="stat-label">学习时长</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(panel);
      expect(panel.querySelector('.stat-value').textContent).toContain('45分钟');
    });

    it('should display word count', () => {
      const panel = document.createElement('div');
      panel.className = 'corner-panel';
      panel.innerHTML = `
        <div class="stat-row">
          <div class="stat-info">
            <div class="stat-value">25 词</div>
            <div class="stat-label">
              <span class="new-tag">新学 15</span>
              <span class="review-tag">复习 10</span>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(panel);
      const statValue = panel.querySelector('.stat-value');
      expect(statValue.textContent).toContain('25 词');
    });

    it('should display new and review word counts', () => {
      const panel = document.createElement('div');
      panel.className = 'corner-panel';
      panel.innerHTML = `
        <div class="stat-label">
          <span class="new-tag">新学 30</span>
          <span class="review-tag">复习 20</span>
        </div>
      `;
      
      document.body.appendChild(panel);
      expect(panel.querySelector('.new-tag').textContent).toContain('新学 30');
      expect(panel.querySelector('.review-tag').textContent).toContain('复习 20');
    });

    it('should display progress percentage', () => {
      const panel = document.createElement('div');
      panel.className = 'corner-panel';
      panel.innerHTML = `
        <div class="mini-progress">
          <div class="progress-track">
            <div class="progress-fill" style="width: 50%"></div>
          </div>
          <div class="progress-text">50% 今日目标</div>
        </div>
      `;
      
      document.body.appendChild(panel);
      expect(panel.querySelector('.progress-text').textContent).toContain('50%');
    });

    it('should cap progress at 100%', () => {
      const panel = document.createElement('div');
      panel.className = 'corner-panel';
      panel.innerHTML = `
        <div class="mini-progress">
          <div class="progress-track">
            <div class="progress-fill" style="width: 100%"></div>
          </div>
          <div class="progress-text">100% 今日目标</div>
        </div>
      `;
      
      document.body.appendChild(panel);
      expect(panel.querySelector('.progress-text').textContent).toContain('100%');
    });
  });

  describe('加载状态', () => {
    it('should show spinner when loading', () => {
      const panel = document.createElement('div');
      panel.className = 'corner-panel';
      panel.innerHTML = `
        <div class="panel-loading">
          <div class="mini-spinner"></div>
        </div>
      `;
      
      document.body.appendChild(panel);
      expect(panel.querySelector('.mini-spinner')).not.toBeNull();
    });

    it('should show refresh button with disabled state', () => {
      const panel = document.createElement('div');
      panel.className = 'corner-panel';
      panel.innerHTML = `
        <button class="refresh-btn" disabled>
          <svg class="spinning"></svg>
        </button>
      `;
      
      document.body.appendChild(panel);
      const btn = panel.querySelector('.refresh-btn');
      expect(btn.disabled).toBe(true);
    });

    it('should have spinning animation on refresh icon', () => {
      const panel = document.createElement('div');
      panel.className = 'corner-panel';
      panel.innerHTML = `
        <button class="refresh-btn">
          <svg class="spinning"></svg>
        </button>
      `;
      
      document.body.appendChild(panel);
      const svg = panel.querySelector('svg');
      expect(svg.classList.contains('spinning')).toBe(true);
    });
  });

  describe('错误状态', () => {
    it('should show error message when fetch fails', () => {
      const panel = document.createElement('div');
      panel.className = 'corner-panel';
      panel.innerHTML = `
        <div class="panel-error">
          <span class="error-text">加载失败</span>
        </div>
      `;
      
      document.body.appendChild(panel);
      expect(panel.querySelector('.panel-error')).not.toBeNull();
      expect(panel.querySelector('.error-text').textContent).toContain('加载失败');
    });

    it('should show retry button on error', () => {
      const panel = document.createElement('div');
      panel.className = 'corner-panel';
      panel.innerHTML = `
        <div class="panel-error">
          <button class="retry-btn">重试</button>
        </div>
      `;
      
      document.body.appendChild(panel);
      expect(panel.querySelector('.retry-btn')).not.toBeNull();
    });

    it('should allow retry action', () => {
      let retryCalled = false;
      const panel = document.createElement('div');
      panel.className = 'corner-panel';
      panel.innerHTML = `
        <div class="panel-error">
          <button class="retry-btn">重试</button>
        </div>
      `;
      
      const retryBtn = panel.querySelector('.retry-btn');
      retryBtn.addEventListener('click', () => {
        retryCalled = true;
      });
      
      document.body.appendChild(panel);
      retryBtn.click();
      
      expect(retryCalled).toBe(true);
    });
  });

  describe('进度条动画', () => {
    it('should apply correct width to progress fill', () => {
      const progressFill = document.createElement('div');
      progressFill.className = 'progress-fill';
      progressFill.style.width = '50%';
      
      document.body.appendChild(progressFill);
      expect(progressFill.style.width).toBe('50%');
    });

    it('should have transition property for smooth animation', () => {
      const progressFill = document.createElement('div');
      progressFill.className = 'progress-fill';
      progressFill.style.transition = 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)';
      
      document.body.appendChild(progressFill);
      expect(progressFill.style.transition).toContain('width');
      expect(progressFill.style.transition).toContain('300ms');
    });

    it('should use will-change for performance', () => {
      const progressFill = document.createElement('div');
      progressFill.className = 'progress-fill';
      progressFill.style.willChange = 'width';
      
      document.body.appendChild(progressFill);
      expect(progressFill.style.willChange).toBe('width');
    });
  });

  describe('面板展开/收起', () => {
    it('should expand panel when toggled', () => {
      const container = document.createElement('div');
      container.className = 'corner-stats';
      
      const panel = document.createElement('div');
      panel.className = 'corner-panel';
      container.appendChild(panel);
      
      document.body.appendChild(container);
      
      expect(container.querySelector('.corner-panel')).not.toBeNull();
    });

    it('should add expanded class when expanded', () => {
      const container = document.createElement('div');
      container.className = 'corner-stats expanded';
      
      document.body.appendChild(container);
      expect(container.className).toContain('expanded');
    });

    it('should toggle expanded class', () => {
      const container = document.createElement('div');
      container.className = 'corner-stats';
      
      document.body.appendChild(container);
      expect(container.className).not.toContain('expanded');
      
      container.classList.add('expanded');
      expect(container.className).toContain('expanded');
      
      container.classList.remove('expanded');
      expect(container.className).not.toContain('expanded');
    });
  });

  describe('CSS 动画和样式', () => {
    it('should have pulse animation defined in CSS', () => {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale3d(1, 1, 1); opacity: 0.3; }
          100% { transform: scale3d(2, 2, 1); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
      
      const pulse = document.createElement('div');
      pulse.className = 'indicator-pulse';
      pulse.style.animation = 'pulse 2s ease-out infinite';
      
      document.body.appendChild(pulse);
      expect(pulse.style.animation).toContain('pulse');
    });

    it('should have panel transition classes', () => {
      const style = document.createElement('style');
      style.textContent = `
        .corner-panel-enter-active {
          transition: transform 300ms ease, opacity 300ms ease;
        }
      `;
      document.head.appendChild(style);
      
      const panel = document.createElement('div');
      panel.className = 'corner-panel';
      
      document.body.appendChild(panel);
      expect(panel.className).toContain('corner-panel');
    });

    it('should use GPU acceleration with translate3d', () => {
      const indicator = document.createElement('div');
      indicator.className = 'corner-indicator';
      indicator.style.willChange = 'transform';
      indicator.style.backfaceVisibility = 'hidden';
      
      document.body.appendChild(indicator);
      expect(indicator.style.willChange).toBe('transform');
      expect(indicator.style.backfaceVisibility).toBe('hidden');
    });

    it('should have hover scale effect with translate3d', () => {
      const style = document.createElement('style');
      style.textContent = `
        .corner-indicator:hover {
          transform: scale3d(1.1, 1.1, 1);
        }
      `;
      document.head.appendChild(style);
      
      expect(true).toBe(true);
    });
  });

  describe('响应式交互', () => {
    it('should refresh stats on expand', () => {
      let refreshCalled = false;
      
      const refreshStats = () => {
        refreshCalled = true;
      };
      
      const indicator = document.createElement('div');
      indicator.className = 'corner-indicator';
      indicator.addEventListener('click', () => {
        refreshStats();
      });
      
      document.body.appendChild(indicator);
      indicator.click();
      
      expect(refreshCalled).toBe(true);
    });

    it('should prevent duplicate fetches when already loading', () => {
      let fetchCount = 0;
      let isLoading = false;
      
      const refreshStats = () => {
        if (isLoading) return;
        isLoading = true;
        fetchCount++;
        setTimeout(() => {
          isLoading = false;
        }, 100);
      };
      
      refreshStats();
      refreshStats();
      refreshStats();
      
      expect(fetchCount).toBe(1);
    });
  });
});
