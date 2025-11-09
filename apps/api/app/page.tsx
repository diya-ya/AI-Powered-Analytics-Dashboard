export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Analytics API</h1>
      <p>API endpoints are available at <code>/api/*</code></p>
      <ul>
        <li><code>GET /api/stats</code></li>
        <li><code>GET /api/invoice-trends</code></li>
        <li><code>GET /api/vendors/top10</code></li>
        <li><code>GET /api/category-spend</code></li>
        <li><code>GET /api/cash-outflow</code></li>
        <li><code>GET /api/invoices</code></li>
        <li><code>POST /api/chat-with-data</code></li>
      </ul>
    </div>
  );
}

