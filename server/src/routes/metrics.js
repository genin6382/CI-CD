const express = require('express');
const dataGenerator = require('../services/dataGenerator');
const logger = require('../utils/logger');

const router = express.Router();

// Get all recent metrics
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const metrics = await dataGenerator.getRecentMetrics(limit);
    
    res.json({
      success: true,
      count: metrics.length,
      data: metrics
    });
    
  } catch (error) {
    logger.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics'
    });
  }
});

// Get metrics by name
router.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const hours = parseInt(req.query.hours) || 24;
    
    const metrics = await dataGenerator.getMetricsByName(name, hours);
    
    if (metrics.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No metrics found for '${name}' in the last ${hours} hours`
      });
    }
    
    // Calculate basic statistics
    const values = metrics.map(m => parseFloat(m.value));
    const stats = {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      average: values.reduce((a, b) => a + b, 0) / values.length,
      latest: values[0]
    };
    
    res.json({
      success: true,
      metric: name,
      period: `${hours} hours`,
      statistics: stats,
      data: metrics
    });
    
  } catch (error) {
    logger.error('Error fetching metric by name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metric data'
    });
  }
});

// Get metrics summary
router.get('/summary/all', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const metricNames = [
      'cpu_usage', 'memory_usage', 'disk_usage', 
      'network_latency', 'request_count', 'error_rate', 'active_users'
    ];
    
    const summary = {};
    
    for (const name of metricNames) {
      const metrics = await dataGenerator.getMetricsByName(name, hours);
      
      if (metrics.length > 0) {
        const values = metrics.map(m => parseFloat(m.value));
        summary[name] = {
          count: values.length,
          latest: values[0],
          average: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
          min: Math.min(...values),
          max: Math.max(...values),
          lastUpdated: metrics[0].timestamp
        };
      } else {
        summary[name] = {
          count: 0,
          message: 'No data available'
        };
      }
    }
    
    res.json({
      success: true,
      period: `${hours} hours`,
      summary,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error generating metrics summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate metrics summary'
    });
  }
});

// Manual trigger for data generation (useful for testing)
router.post('/generate', async (req, res) => {
  try {
    await dataGenerator.generateData();
    
    res.json({
      success: true,
      message: 'Data generation triggered successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error triggering data generation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger data generation'
    });
  }
});

module.exports = router;