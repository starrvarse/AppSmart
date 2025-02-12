export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Log request body if present
  if (Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }

  // Capture response
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - start;
    console.log(`Response Time: ${duration}ms`);
    console.log(`Status: ${res.statusCode}`);
    
    // Call original send
    originalSend.call(this, body);
  };

  next();
};
