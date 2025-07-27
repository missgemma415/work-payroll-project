export const onRequestGet: PagesFunction = async () => {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'prophet-growth-analysis-api',
      version: '1.0.0',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
};
