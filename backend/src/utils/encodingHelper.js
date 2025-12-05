const BROKEN_ENCODING_PATTERNS = /[ß╗⌐─ân╞░╗║ít├¿o╞░╗║ng├ánh║⌐╗]/;

const fixDoubleEncoding = (text) => {
  try {
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      if (charCode <= 0xFF) {
        bytes.push(charCode);
      } else {
        const utf8Bytes = Buffer.from(text[i], 'utf8');
        for (let j = 0; j < utf8Bytes.length; j++) {
          bytes.push(utf8Bytes[j]);
        }
      }
    }
    
    if (bytes.length === 0) return text;
    
    const utf8Text = Buffer.from(bytes).toString('utf8');
    const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/.test(utf8Text);
    const hasBroken = BROKEN_ENCODING_PATTERNS.test(utf8Text);
    
    if (hasVietnamese && !hasBroken && utf8Text !== text) {
      return utf8Text;
    }
  } catch (e) {
  }
  return text;
};

const fixLatin1ToUtf8 = (text) => {
  try {
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      if (charCode <= 0xFF) {
        bytes.push(charCode);
      }
    }
    
    if (bytes.length === 0) return text;
    
    const latin1Buffer = Buffer.from(bytes);
    const utf8Text = latin1Buffer.toString('utf8');
    
    const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/.test(utf8Text);
    const hasBroken = BROKEN_ENCODING_PATTERNS.test(utf8Text);
    
    if (hasVietnamese && !hasBroken && utf8Text !== text) {
      return utf8Text;
    }
  } catch (e) {
  }
  return text;
};

export const normalizeTextEncoding = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  try {
    if (text.length === 0) {
      return text;
    }

    const hasBrokenEncoding = BROKEN_ENCODING_PATTERNS.test(text);
    const hasValidVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/.test(text);
    
    if (!hasBrokenEncoding && hasValidVietnamese) {
      return text;
    }

    if (!hasBrokenEncoding) {
      return text;
    }

    let fixed = fixDoubleEncoding(text);
    
    if (fixed === text) {
      fixed = fixLatin1ToUtf8(text);
    }

    if (fixed === text && hasBrokenEncoding) {
      const replacements = [
        ['ß╗⌐c', 'ức'],
        ['ß╗⌐', 'ứ'],
        ['─ân', 'ăn'],
        ['ß║ít', 'hạt'],
        ['╞░ß╗íng', 'dưỡng'],
        ['╞░ß╗║ng', 'trưởng'],
        ['├¿o', 'mèo'],
        ['├ánh', 'thành'],
      ];
      
      for (const [pattern, replacement] of replacements) {
        fixed = fixed.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
      }
    }

    return fixed;
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

