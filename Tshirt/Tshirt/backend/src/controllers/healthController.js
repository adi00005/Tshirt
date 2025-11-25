// @ts-check

/**
 * @description Health check controller for monitoring the application status
 * @module controllers/healthController
 */

/**
 * @route   GET /api/health
 * @desc    Basic health check endpoint
 * @access  Public
 * @returns {Object} Health status object
 */
const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
};

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with system information
 * @access  Private/Admin
 * @returns {Object} Detailed health status object
 */
const getDetailedHealthStatus = (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'success',
    server: {
      status: 'running',
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: memoryUsage.external ? `${Math.round(memoryUsage.external / 1024 / 1024)} MB` : 'N/A',
    },
    environment: process.env.NODE_ENV || 'development',
  });
};

export {
  getHealthStatus,
  getDetailedHealthStatus
};
