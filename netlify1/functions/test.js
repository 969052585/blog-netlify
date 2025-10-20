export const handler = async (event) => {
  try {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Netlify Function is working!',
        timestamp: new Date().toISOString()
      }),
      isBase64Encoded: false
    };
  } catch (error) {
    console.error('Test function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};