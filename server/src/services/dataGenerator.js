const db = require('../database/db');
const logger = require('../utils/logger');

class DataGenerator {
  constructor() {
    this.interval = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      logger.warn('Data generator is already running');
      return;
    }

    logger.info('Starting data generator (30-second interval)');
    this.isRunning = true;
    
    // Generate initial data
    this.generateData();
    
    // Set interval for every 30 seconds
    this.interval = setInterval(() => {
      this.generateData();
    }, 30000);
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    logger.info('Stopping data generator');
    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async generateData() {
    try {
      const metrics = this.generateMetrics();
      
      for (const metric of metrics) {
        await this.saveMetric(metric);
      }
      
      logger.info(`Generated and saved ${metrics.length} metrics`);
      
    } catch (error) {
      logger.error('Error generating data:', error);
    }
  }

  generateMetrics() {
    const metricTypes = [
      'cpu_usage',
      'memory_usage',
      'disk_usage',
      'network_latency',
      'request_count',
      'error_rate',
      'active_users'
    ];

    return metricTypes.map(name => ({
      name,
      value: this.generateValue(name),
      metadata: this.generateMetadata(name)
    }));
  }

  generateValue(metricName) {
    switch (metricName) {
      case 'cpu_usage':
      case 'memory_usage':
      case 'disk_usage':
        return Math.round((Math.random() * 100) * 100) / 100; // 0-100%
      
      case 'network_latency':
        return Math.round((Math.random() * 200 + 10) * 100) / 100; // 10-210ms
      
      case 'request_count':
        return Math.floor(Math.random() * 1000 + 100); // 100-1100 requests
      
      case 'error_rate':
        return Math.round((Math.random() * 5) * 100) / 100; // 0-5%
      
      case 'active_users':
        return Math.floor(Math.random() * 500 + 50); // 50-550 users
      
      default:
        return Math.round(Math.random() * 100);
    }
  }

  generateMetadata(metricName) {
    const baseMetadata = {
      timestamp: new Date().toISOString(),
      source: 'data-generator',
      version: '1.0.0'
    };

    switch (metricName) {
      case 'cpu_usage':
        return {
          ...baseMetadata,
          cores: Math.floor(Math.random() * 8 + 2),
          temperature: Math.round((Math.random() * 30 + 40) * 100) / 100
        };
      
      case 'memory_usage':
        return {
          ...baseMetadata,
          total_memory: '8GB',
          available_memory: `${Math.round((Math.random() * 4 + 2) * 100) / 100}GB`
        };
      
      case 'network_latency':
        return {
          ...baseMetadata,
          endpoint: `api-${Math.floor(Math.random() * 3 + 1)}.example.com`,
          protocol: Math.random() > 0.5 ? 'https' : 'http'
        };
      
      default:
        return baseMetadata;
    }
  }

  async saveMetric(metric) {
    const query = `
      INSERT INTO metrics (name, value, metadata)
      VALUES ($1, $2, $3)
    `;
    
    await db.query(query, [
      metric.name,
      metric.value,
      JSON.stringify(metric.metadata)
    ]);
  }

  async getRecentMetrics(limit = 100) {
    const query = `
      SELECT * FROM metrics
      ORDER BY timestamp DESC
      LIMIT $1
    `;
    
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  async getMetricsByName(name, hours = 24) {
    const query = `
      SELECT * FROM metrics
      WHERE name = $1 AND timestamp >= NOW() - INTERVAL '${hours} hours'
      ORDER BY timestamp DESC
    `;
    
    const result = await db.query(query, [name]);
    return result.rows;
  }
}

module.exports = new DataGenerator();