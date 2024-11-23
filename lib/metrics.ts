type MetricType = 'counter' | 'gauge' | 'histogram';

interface MetricValue {
  type: MetricType;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

class Metrics {
  private static metrics: Map<string, MetricValue[]> = new Map();

  private static track(
    name: string, 
    value: number, 
    type: MetricType,
    tags?: Record<string, string>
  ) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metric: MetricValue = {
      type,
      value,
      timestamp: Date.now(),
      tags
    };

    this.metrics.get(name)?.push(metric);

    // In development, log the metric
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Metric] ${name}: ${value}`, tags);
    }

    // In production, you might want to send this to a metrics service
    // Example: Prometheus, DataDog, or CloudWatch
  }

  static increment(name: string, value: number = 1, tags?: Record<string, string>) {
    this.track(name, value, 'counter', tags);
  }

  static gauge(name: string, value: number, tags?: Record<string, string>) {
    this.track(name, value, 'gauge', tags);
  }

  static histogram(name: string, value: number, tags?: Record<string, string>) {
    this.track(name, value, 'histogram', tags);
  }

  static getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  // Clear metrics (useful for testing)
  static clear() {
    this.metrics.clear();
  }
}

export const metrics = Metrics; 