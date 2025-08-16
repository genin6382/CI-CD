const express = require('express');
const db = require('../database/db');
const logger = require('../utils/logger');

const router = express.Router();

// Basic health check
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database connectivity
    await db.query('SELECT 1');
    const dbResponseTime = Date.now() - startTime;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`
      },
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
    
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const checks = [];
    
    // Database check
    const dbStart = Date.now();
    try {
      await db.query('SELECT NOW()');
      checks.push({
        name: 'database',
        status: 'pass',
        responseTime: `${Date.now() - dbStart}ms`
      });
    } catch (error) {
      checks.push({
        name: 'database',
        status: 'fail',
        error: error.message
      });
    }
    
    // Memory check
    const memory = process.memoryUsage();
    const memoryUsage = (memory.heapUsed / memory.heapTotal) * 100;
    checks.push({
      name: 'memory',
      status: memoryUsage < 90 ? 'pass' : 'warn',
      usage: `${Math.round(memoryUsage)}%`,
      details: memory
    });
    
    const allPassed = checks.every(check => check.status === 'pass');
    
    res.status(allPassed ? 200 : 503).json({
      status: allPassed ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
      system: {
        uptime: process.uptime(),
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      }
    });
    
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;