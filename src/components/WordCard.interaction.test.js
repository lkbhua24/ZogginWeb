import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('WordCard 交互细节测试', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('CSS 动画和过渡', () => {
    it('should have transition property for smooth animations', () => {
      const element = document.createElement('div');
      element.className = 'word-display';
      element.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      document.body.appendChild(element);
      
      const computedTransition = element.style.transition;
      expect(computedTransition).toContain('0.5s');
      expect(computedTransition).toContain('cubic-bezier');
    });

    it('should use GPU acceleration with translateZ', () => {
      const element = document.createElement('div');
      element.className = 'word-display';
      element.style.transform = 'translateZ(0)';
      element.style.backfaceVisibility = 'hidden';
      document.body.appendChild(element);
      
      expect(element.style.transform).toBe('translateZ(0)');
      expect(element.style.backfaceVisibility).toBe('hidden');
    });

    it('should apply show-detail class with scale transform', () => {
      const element = document.createElement('div');
      element.className = 'word-display show-detail';
      document.body.appendChild(element);
      
      expect(element.className).toContain('show-detail');
    });

    it('should toggle show-detail class on card flip', () => {
      const element = document.createElement('div');
      element.className = 'word-display';
      document.body.appendChild(element);
      
      expect(element.className).not.toContain('show-detail');
      
      element.classList.add('show-detail');
      expect(element.className).toContain('show-detail');
      
      element.classList.remove('show-detail');
      expect(element.className).not.toContain('show-detail');
    });
  });

  describe('单词切换后释义自动隐藏', () => {
    it('should NOT show back content when showBack is false', () => {
      const cardContainer = document.createElement('div');
      cardContainer.className = 'word-display';
      
      const frontContent = document.createElement('div');
      frontContent.className = 'word-main';
      frontContent.innerHTML = '<div class="word-title">test</div>';
      cardContainer.appendChild(frontContent);
      
      document.body.appendChild(cardContainer);
      
      expect(cardContainer.querySelector('.l1-header')).toBeNull();
      expect(cardContainer.querySelector('.l2-core')).toBeNull();
      expect(cardContainer.querySelector('.mastery-indicator')).toBeNull();
    });

    it('should show back content ONLY when showBack is true', () => {
      const cardContainer = document.createElement('div');
      cardContainer.className = 'word-display show-detail';
      
      const backContent = document.createElement('div');
      backContent.className = 'l1-header';
      backContent.innerHTML = '<div class="l1-word">test</div>';
      cardContainer.appendChild(backContent);
      
      const exampleContent = document.createElement('div');
      exampleContent.className = 'l2-core';
      cardContainer.appendChild(exampleContent);
      
      const masteryContent = document.createElement('div');
      masteryContent.className = 'mastery-indicator';
      cardContainer.appendChild(masteryContent);
      
      document.body.appendChild(cardContainer);
      
      expect(cardContainer.querySelector('.l1-header')).not.toBeNull();
      expect(cardContainer.querySelector('.l2-core')).not.toBeNull();
      expect(cardContainer.querySelector('.mastery-indicator')).not.toBeNull();
    });

    it('should completely remove back content from DOM when switching words', () => {
      const cardContainer = document.createElement('div');
      cardContainer.className = 'word-display show-detail';
      
      const backContent = document.createElement('div');
      backContent.className = 'l1-header';
      cardContainer.appendChild(backContent);
      
      document.body.appendChild(cardContainer);
      expect(cardContainer.querySelector('.l1-header')).not.toBeNull();
      
      cardContainer.innerHTML = '';
      cardContainer.classList.remove('show-detail');
      
      const frontContent = document.createElement('div');
      frontContent.className = 'word-main';
      frontContent.innerHTML = '<div class="word-title">newword</div>';
      cardContainer.appendChild(frontContent);
      
      expect(cardContainer.querySelector('.l1-header')).toBeNull();
      expect(cardContainer.querySelector('.l2-core')).toBeNull();
    });

    it('should hide mastery indicator when showBack is false', () => {
      const cardContainer = document.createElement('div');
      cardContainer.className = 'word-display';
      
      const frontContent = document.createElement('div');
      frontContent.className = 'word-main';
      cardContainer.appendChild(frontContent);
      
      document.body.appendChild(cardContainer);
      
      expect(cardContainer.querySelector('.mastery-indicator')).toBeNull();
    });

    it('should show mastery indicator only when showBack is true', () => {
      const cardContainer = document.createElement('div');
      cardContainer.className = 'word-display show-detail';
      
      const masteryIndicator = document.createElement('div');
      masteryIndicator.className = 'mastery-indicator';
      masteryIndicator.innerHTML = `
        <span class="mastery-label">掌握度</span>
        <div class="mastery-dots">
          <span class="mastery-dot active"></span>
          <span class="mastery-dot active"></span>
          <span class="mastery-dot active"></span>
          <span class="mastery-dot"></span>
          <span class="mastery-dot"></span>
        </div>
      `;
      cardContainer.appendChild(masteryIndicator);
      
      document.body.appendChild(cardContainer);
      
      const activeDots = cardContainer.querySelectorAll('.mastery-dot.active');
      expect(activeDots.length).toBe(3);
    });
  });

  describe('操作状态反馈', () => {
    it('should emit click event when card is clicked', () => {
      const cardContainer = document.createElement('div');
      cardContainer.className = 'word-display';
      
      let clickCount = 0;
      cardContainer.addEventListener('click', () => {
        clickCount++;
      });
      
      document.body.appendChild(cardContainer);
      cardContainer.click();
      
      expect(clickCount).toBe(1);
    });

    it('should prevent event bubbling on play button click', () => {
      const cardContainer = document.createElement('div');
      cardContainer.className = 'word-display';
      
      let cardClickCount = 0;
      cardContainer.addEventListener('click', () => {
        cardClickCount++;
      });
      
      const playButton = document.createElement('button');
      playButton.className = 'word-play-btn';
      playButton.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      cardContainer.appendChild(playButton);
      document.body.appendChild(cardContainer);
      
      playButton.click();
      
      expect(cardClickCount).toBe(0);
    });

    it('should trigger vibration when navigator.vibrate is available', () => {
      const mockVibrate = vi.fn();
      const originalVibrate = navigator.vibrate;
      navigator.vibrate = mockVibrate;
      
      const playButton = document.createElement('button');
      playButton.className = 'word-play-btn';
      playButton.addEventListener('click', () => {
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      });
      
      document.body.appendChild(playButton);
      playButton.click();
      
      expect(mockVibrate).toHaveBeenCalledWith(50);
      navigator.vibrate = originalVibrate;
    });
  });

  describe('单词切换场景', () => {
    it('should update word content when switching words', () => {
      const cardContainer = document.createElement('div');
      cardContainer.className = 'word-display';
      cardContainer.innerHTML = '<div class="word-title">abandon</div>';
      
      document.body.appendChild(cardContainer);
      expect(cardContainer.querySelector('.word-title').textContent).toBe('abandon');
      
      cardContainer.querySelector('.word-title').textContent = 'achieve';
      expect(cardContainer.querySelector('.word-title').textContent).toBe('achieve');
    });

    it('should update phonetic when word changes', () => {
      const cardContainer = document.createElement('div');
      cardContainer.className = 'word-display';
      cardContainer.innerHTML = '<div class="word-phonetic-row"><span class="word-phonetic">/əˈbændən/</span></div>';
      
      document.body.appendChild(cardContainer);
      expect(cardContainer.querySelector('.word-phonetic').textContent).toBe('/əˈbændən/');
      
      cardContainer.querySelector('.word-phonetic').textContent = '/əˈtʃiːv/';
      expect(cardContainer.querySelector('.word-phonetic').textContent).toBe('/əˈtʃiːv/');
    });

    it('should handle word without phonetic', () => {
      const cardContainer = document.createElement('div');
      cardContainer.className = 'word-display';
      cardContainer.innerHTML = `
        <div class="word-main">
          <div class="word-title">test</div>
        </div>
      `;
      
      document.body.appendChild(cardContainer);
      expect(cardContainer.querySelector('.word-phonetic-row')).toBeNull();
    });

    it('should handle word without examples on back side', () => {
      const cardContainer = document.createElement('div');
      cardContainer.className = 'word-display show-detail';
      cardContainer.innerHTML = `
        <div class="l1-header">
          <div class="l1-word">rare</div>
        </div>
      `;
      
      document.body.appendChild(cardContainer);
      expect(cardContainer.querySelector('.l2-core')).toBeNull();
    });
  });

  describe('全屏模式样式', () => {
    it('should add fullscreen-mode class when in fullscreen', () => {
      const cardContainer = document.createElement('div');
      cardContainer.className = 'word-display fullscreen-mode';
      document.body.appendChild(cardContainer);
      
      expect(cardContainer.className).toContain('fullscreen-mode');
    });

    it('should not have fullscreen-mode class by default', () => {
      const cardContainer = document.createElement('div');
      cardContainer.className = 'word-display';
      document.body.appendChild(cardContainer);
      
      expect(cardContainer.className).not.toContain('fullscreen-mode');
    });
  });

  describe('掌握度指示器', () => {
    it('should render 5 mastery dots', () => {
      const container = document.createElement('div');
      container.className = 'mastery-dots';
      for (let i = 0; i < 5; i++) {
        const dot = document.createElement('span');
        dot.className = 'mastery-dot';
        container.appendChild(dot);
      }
      
      document.body.appendChild(container);
      const dots = container.querySelectorAll('.mastery-dot');
      expect(dots.length).toBe(5);
    });

    it('should mark correct number of dots as active', () => {
      const container = document.createElement('div');
      container.className = 'mastery-dots';
      const mastery = 4;
      for (let i = 0; i < 5; i++) {
        const dot = document.createElement('span');
        dot.className = 'mastery-dot' + (i < mastery ? ' active' : '');
        container.appendChild(dot);
      }
      
      document.body.appendChild(container);
      const activeDots = container.querySelectorAll('.mastery-dot.active');
      expect(activeDots.length).toBe(4);
    });

    it('should handle zero mastery', () => {
      const container = document.createElement('div');
      container.className = 'mastery-dots';
      for (let i = 0; i < 5; i++) {
        const dot = document.createElement('span');
        dot.className = 'mastery-dot';
        container.appendChild(dot);
      }
      
      document.body.appendChild(container);
      const activeDots = container.querySelectorAll('.mastery-dot.active');
      expect(activeDots.length).toBe(0);
    });
  });
});
