// Simple in-memory database version (no external database needed)

// In-memory storage
let certificates = [
  {
    id: 1,
    certificatenumber: 'GIE-2024-001234',
    gemstonetype: 'Natural Diamond',
    caratweight: '1.25',
    color: 'D',
    clarity: 'VVS1',
    cut: 'Excellent',
    polish: 'Excellent',
    symmetry: 'Excellent',
    fluorescence: 'None',
    measurements: '6.85 x 6.91 x 4.24 mm',
    origin: 'Natural',
    issuedate: '2024-01-15',
    imageurl: null,
    createdat: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    certificatenumber: 'GIE-2024-001235',
    gemstonetype: 'Natural Ruby',
    caratweight: '2.15',
    color: 'Pigeon Blood Red',
    clarity: 'VVS2',
    cut: 'Oval',
    polish: 'Excellent',
    symmetry: 'Very Good',
    fluorescence: 'None',
    measurements: '8.12 x 6.98 x 4.55 mm',
    origin: 'Myanmar',
    issuedate: '2024-01-20',
    imageurl: null,
    createdat: '2024-01-20T10:00:00Z'
  },
  {
    id: 3,
    certificatenumber: 'GIE-2024-001236',
    gemstonetype: 'Natural Sapphire',
    caratweight: '3.45',
    color: 'Royal Blue',
    clarity: 'VVS1',
    cut: 'Cushion',
    polish: 'Excellent',
    symmetry: 'Very Good',
    fluorescence: 'None',
    measurements: '9.15 x 8.92 x 5.78 mm',
    origin: 'Kashmir',
    issuedate: '2024-02-01',
    imageurl: null,
    createdat: '2024-02-01T10:00:00Z'
  }
];

let nextId = 4;

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

module.exports = async function handler(req, res) {
  console.log('Simple API called:', req.method, req.url);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    if (req.method === 'GET') {
      // Get all certificates
      return res.status(200).json(certificates);
    }

    if (req.method === 'POST') {
      // Create new certificate
      const {
        certificateNumber,
        gemstoneType,
        caratWeight,
        color,
        clarity,
        cut,
        polish,
        symmetry,
        fluorescence,
        measurements,
        origin,
        issueDate,
        imageUrl
      } = req.body;

      // Validate required fields
      const requiredFields = ['certificateNumber', 'gemstoneType', 'caratWeight', 'color', 'clarity', 'cut', 'polish', 'symmetry', 'fluorescence', 'measurements', 'origin', 'issueDate'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          message: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }

      // Check for duplicate certificate number
      const existingCert = certificates.find(cert => 
        cert.certificatenumber.toLowerCase() === certificateNumber.toLowerCase()
      );

      if (existingCert) {
        return res.status(400).json({
          error: 'Certificate number already exists',
          message: 'This certificate number has already been used. Please use a different number.'
        });
      }

      // Create new certificate
      const newCertificate = {
        id: nextId++,
        certificatenumber: certificateNumber,
        gemstonetype: gemstoneType,
        caratweight: caratWeight,
        color: color,
        clarity: clarity,
        cut: cut,
        polish: polish,
        symmetry: symmetry,
        fluorescence: fluorescence,
        measurements: measurements,
        origin: origin,
        issuedate: issueDate,
        imageurl: imageUrl || null,
        createdat: new Date().toISOString()
      };

      certificates.push(newCertificate);
      console.log('Certificate created successfully:', certificateNumber);
      
      return res.status(201).json(newCertificate);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Simple API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process certificate request'
    });
  }
};