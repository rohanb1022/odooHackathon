const axios = require('axios');

const ML_BASE = process.env.ML_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Internal HTTP client for backend-ml service.
 * Frontend NEVER communicates with backend-ml directly.
 */
const mlClient = axios.create({
  baseURL: ML_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * POST /analyze-maintenance
 * Analyze a maintenance request and get AI insights.
 */
const analyzeMaintenance = async (payload, headers = {}) => {
  const response = await mlClient.post('/analyze-maintenance', payload, { headers });
  return response.data;
};

/**
 * POST /asset-health
 * Get health score for an asset based on its history.
 */
const getAssetHealth = async (payload, headers = {}) => {
  const response = await mlClient.post('/asset-health', payload, { headers });
  return response.data;
};

/**
 * POST /predict-maintenance
 * Predict when an asset will next need maintenance.
 */
const predictMaintenance = async (payload, headers = {}) => {
  const response = await mlClient.post('/predict-maintenance', payload, { headers });
  return response.data;
};

/**
 * POST /chat
 * Chat with the AI assistant (proxied from frontend via backend).
 */
const chat = async (payload, headers = {}) => {
  const response = await mlClient.post('/chat', payload, { headers });
  return response.data;
};

module.exports = {
  analyzeMaintenance,
  getAssetHealth,
  predictMaintenance,
  chat,
};
