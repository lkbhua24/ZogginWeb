export class BrowserCompatibility {
  constructor() {
    this.supportedBrowsers = {
      chrome: { minVersion: 60 },
      firefox: { minVersion: 55 },
      safari: { minVersion: 11 },
      edge: { minVersion: 79 },
      opera: { minVersion: 47 }
    };
    
    this.requiredFeatures = [
      'Promise',
      'async/await',
      'localStorage',
      'IndexedDB',
      'Fetch API',
      'AbortController'
    ];
    
    this.compatibilityIssues = [];
  }

  detectBrowser() {
    const ua = navigator.userAgent;
    let browser = 'unknown';
    let version = 0;
    
    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
      browser = 'chrome';
      version = parseInt(ua.match(/Chrome\/(\d+)/)[1]);
    } else if (ua.indexOf('Firefox') > -1) {
      browser = 'firefox';
      version = parseInt(ua.match(/Firefox\/(\d+)/)[1]);
    } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
      browser = 'safari';
      version = parseInt(ua.match(/Version\/(\d+)/)[1]);
    } else if (ua.indexOf('Edg') > -1) {
      browser = 'edge';
      version = parseInt(ua.match(/Edg\/(\d+)/)[1]);
    } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
      browser = 'opera';
      version = parseInt(ua.match(/(?:Opera|OPR)\/(\d+)/)[1]);
    }
    
    return { browser, version };
  }

  checkBrowserSupport() {
    const { browser, version } = this.detectBrowser();
    
    if (browser === 'unknown') {
      this.compatibilityIssues.push({
        type: 'browser',
        message: '未知浏览器，某些功能可能不可用',
        severity: 'warning'
      });
      return false;
    }
    
    const supported = this.supportedBrowsers[browser];
    if (!supported) {
      this.compatibilityIssues.push({
        type: 'browser',
        message: `不支持 ${browser} 浏览器`,
        severity: 'error'
      });
      return false;
    }
    
    if (version < supported.minVersion) {
      this.compatibilityIssues.push({
        type: 'version',
        message: `${browser} 版本过低，当前版本 ${version}，最低要求 ${supported.minVersion}`,
        severity: 'warning'
      });
      return false;
    }
    
    return true;
  }

  checkFeatures() {
    const featureSupport = {};
    
    featureSupport['Promise'] = typeof Promise !== 'undefined';
    featureSupport['async/await'] = this.checkAsyncAwait();
    featureSupport['localStorage'] = this.checkLocalStorage();
    featureSupport['IndexedDB'] = this.checkIndexedDB();
    featureSupport['Fetch API'] = typeof fetch !== 'undefined';
    featureSupport['AbortController'] = typeof AbortController !== 'undefined';
    
    Object.entries(featureSupport).forEach(([feature, supported]) => {
      if (!supported) {
        this.compatibilityIssues.push({
          type: 'feature',
          message: `不支持 ${feature}`,
          severity: 'error'
        });
      }
    });
    
    return featureSupport;
  }

  checkAsyncAwait() {
    try {
      eval('(async () => {})');
      return true;
    } catch (e) {
      return false;
    }
  }

  checkLocalStorage() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  checkIndexedDB() {
    try {
      return 'indexedDB' in window && window.indexedDB !== null;
    } catch (e) {
      return false;
    }
  }

  checkNetworkConnectivity() {
    const supported = 'onLine' in navigator;
    
    if (!supported) {
      this.compatibilityIssues.push({
        type: 'network',
        message: '不支持网络状态检测',
        severity: 'warning'
      });
    }
    
    return supported;
  }

  checkPerformanceAPI() {
    const supported = 'performance' in window && 'now' in performance;
    
    if (!supported) {
      this.compatibilityIssues.push({
        type: 'performance',
        message: '不支持 Performance API',
        severity: 'info'
      });
    }
    
    return supported;
  }

  runAllChecks() {
    const browserSupported = this.checkBrowserSupport();
    const featureSupport = this.checkFeatures();
    const networkSupported = this.checkNetworkConnectivity();
    const performanceSupported = this.checkPerformanceAPI();
    
    return {
      browserSupported,
      featureSupport,
      networkSupported,
      performanceSupported,
      issues: this.compatibilityIssues,
      isFullyCompatible: browserSupported && 
                         Object.values(featureSupport).every(v => v) &&
                         networkSupported
    };
  }

  getCompatibilityReport() {
    const { browser, version } = this.detectBrowser();
    const checks = this.runAllChecks();
    
    return {
      browser: {
        name: browser,
        version,
        supported: checks.browserSupported
      },
      features: checks.featureSupport,
      network: checks.networkSupported,
      performance: checks.performanceSupported,
      issues: checks.issues,
      isFullyCompatible: checks.isFullyCompatible,
      timestamp: new Date().toISOString()
    };
  }

  logCompatibilityReport() {
    const report = this.getCompatibilityReport();
    
    if (report.isFullyCompatible) {
      console.log('✅ 浏览器完全兼容，所有功能可用');
    } else {
      console.warn('⚠️ 浏览器兼容性问题：');
      report.issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : 
                     issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        console.warn(`${icon} ${issue.message}`);
      });
    }
    
    return report;
  }
}

export const browserCompatibility = new BrowserCompatibility();

export function checkBrowserCompatibility() {
  return browserCompatibility.logCompatibilityReport();
}

export function isBrowserCompatible() {
  const report = browserCompatibility.getCompatibilityReport();
  return report.isFullyCompatible;
}
