export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  return new Response(JSON.stringify({
    error: 'Internal Server Error',
    message: error instanceof Error ? error.message : 'Unknown error occurred'
  }), {
    status: 500,
    headers: {
      'Content-Type': 'application/json'
    }
  });
} 