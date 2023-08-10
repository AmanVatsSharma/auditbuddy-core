import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const mockServer = setupServer(
  http.get('https://example.com', () => {
    return new HttpResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta name="generator" content="WordPress 6.0" />
          <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  })
); 