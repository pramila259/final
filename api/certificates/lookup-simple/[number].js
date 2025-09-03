// Simple in-memory certificate lookup (no external database needed)

// In-memory storage - same as simple.js
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

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

module.exports = async function handler(req, res) {
  console.log('Simple lookup API called:', req.method, req.url);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    const { number } = req.query;
    console.log('Looking up certificate:', number);
    
    // Search for certificate (case-insensitive)
    const certificate = certificates.find(cert => 
      cert.certificatenumber.toLowerCase() === number.toLowerCase()
    );
    
    if (certificate) {
      console.log('Certificate found:', certificate.certificatenumber);
      return res.status(200).json(certificate);
    } else {
      console.log('Certificate not found:', number);
      return res.status(404).json({ 
        message: 'Certificate not found' 
      });
    }
  } catch (error) {
    console.error('Simple lookup error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to lookup certificate'
    });
  }
};