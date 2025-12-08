import { normalizeObjectEncoding } from '../utils/encodingHelper.js';

export const encodingMiddleware = (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    if (data && typeof data === 'object') {
      const normalized = normalizeObjectEncoding(data);
      return originalJson(normalized);
    }
    return originalJson(data);
  };
  
  next();
};

