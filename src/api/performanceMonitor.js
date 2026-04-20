export class PerformanceMonitor {
  constructor(config = {}) {
    this.metrics = [];
    this.maxMetrics = config.maxMetrics || 1000;
    this.alertThresholds = {
      responseTime: config.responseTimeThreshold || 100,
      errorRate: config.errorRateThreshold || 5,
      cacheHitRate: config.cacheHitRateThreshold || 80
    };
    
    this.alerts = [];
    this.maxAlerts = config.maxAlerts || 100;
    
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    this.totalResponseTime = 0;
    
    this.monitoringInterval = setInterval(() => {
      this.checkThresholds();
    }, 10000);
  }

  recordRequest(metric) {
    this.metrics.push({
      ...metric,
      timestamp: Date.now()
    });
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
    
    this.requestCount++;
    if (!metric.success) {
      this.errorCount++;
    }
    this.totalResponseTime += metric.duration || 0;
  }

  checkThresholds() {
    const stats = this.getStats();
    
    if (stats.averageResponseTime > this.alertThresholds.responseTime) {
      this.addAlert('performance', `平均响应时间 ${stats.averageResponseTime}ms 超过阈值 ${this.alertThresholds.responseTime}ms`);
    }
    
    if (stats.errorRate > this.alertThresholds.errorRate) {
      this.addAlert('error', `错误率 ${stats.errorRate}% 超过阈值 ${this.alertThresholds.errorRate}%`);
    }
    
    if (stats.cacheHitRate < this.alertThresholds.cacheHitRate) {
      this.addAlert('cache', `缓存命中率 ${stats.cacheHitRate}% 低于阈值 ${this.alertThresholds.cacheHitRate}%`);
    }
  }

  addAlert(type, message) {
    const alert = {
      type,
      message,
      timestamp: Date.now(),
      read: false
    };
    
    this.alerts.unshift(alert);
    
    if (this.alerts.length > this.maxAlerts) {
      this.alerts.pop();
    }
    
    console.warn(`[Performance Alert] ${type}: ${message}`);
  }

  getStats() {
    const now = Date.now();
    const uptime = now - this.startTime;
    const averageResponseTime = this.requestCount > 0 
      ? Math.round(this.totalResponseTime / this.requestCount) 
      : 0;
    const errorRate = this.requestCount > 0 
      ? ((this.errorCount / this.requestCount) * 100).toFixed(2) 
      : 0;
    
    const recentMetrics = this.metrics.slice(-100);
    const p50 = this.calculatePercentile(recentMetrics, 50);
    const p95 = this.calculatePercentile(recentMetrics, 95);
    const p99 = this.calculatePercentile(recentMetrics, 99);
    
    return {
      uptime: Math.round(uptime / 1000),
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime,
      errorRate: `${errorRate}%`,
      requestsPerSecond: this.requestCount > 0 
        ? (this.requestCount / (uptime / 1000)).toFixed(2) 
        : 0,
      percentiles: {
        p50,
        p95,
        p99
      },
      cacheHitRate: this.calculateCacheHitRate(recentMetrics)
    };
  }

  calculatePercentile(metrics, percentile) {
    if (metrics.length === 0) return 0;
    
    const durations = metrics
      .map(m => m.duration || 0)
      .sort((a, b) => a - b);
    
    const index = Math.ceil((percentile / 100) * durations.length) - 1;
    return durations[index] || 0;
  }

  calculateCacheHitRate(metrics) {
    if (metrics.length === 0) return '0%';
    
    const cacheHits = metrics.filter(m => m.fromCache).length;
    const rate = (cacheHits / metrics.length * 100).toFixed(2);
    return `${rate}%`;
  }

  getAlerts(unreadOnly = false) {
    if (unreadOnly) {
      return this.alerts.filter(a => !a.read);
    }
    return this.alerts;
  }

  markAlertsAsRead() {
    this.alerts.forEach(alert => {
      alert.read = true;
    });
  }

  clearAlerts() {
    this.alerts = [];
  }

  getRecentMetrics(count = 100) {
    return this.metrics.slice(-count);
  }

  reset() {
    this.metrics = [];
    this.alerts = [];
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    this.totalResponseTime = 0;
  }

  destroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  getHealthStatus() {
    const stats = this.getStats();
    const avgTime = parseInt(stats.averageResponseTime);
    const errorRate = parseFloat(stats.errorRate);
    
    if (avgTime <= 50 && errorRate < 1) {
      return { status: 'excellent', color: 'green', message: '系统运行优秀' };
    } else if (avgTime <= 100 && errorRate < 3) {
      return { status: 'good', color: 'blue', message: '系统运行良好' };
    } else if (avgTime <= 200 && errorRate < 5) {
      return { status: 'fair', color: 'yellow', message: '系统运行一般' };
    } else {
      return { status: 'poor', color: 'red', message: '系统性能较差' };
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
