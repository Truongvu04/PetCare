export const normalizeTextEncoding = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  try {
    if (Buffer.isEncoding('utf8') && Buffer.from(text, 'utf8').toString('utf8') === text) {
      return text;
    }

    const buffer = Buffer.from(text, 'latin1');
    const normalized = buffer.toString('utf8');
    
    const hasVietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i.test(normalized);
    
    if (hasVietnameseChars && normalized !== text) {
      return normalized;
    }
    
    return text;
  } catch (error) {
    console.warn('Encoding normalization failed:', error);
    return text;
  }
};

export const normalizeObjectEncoding = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => normalizeObjectEncoding(item));
  }

  const normalized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      normalized[key] = normalizeTextEncoding(value);
    } else if (typeof value === 'object' && value !== null) {
      normalized[key] = normalizeObjectEncoding(value);
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
};

