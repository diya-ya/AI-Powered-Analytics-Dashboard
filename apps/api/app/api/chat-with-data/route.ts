import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ChatRequest {
  query: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ChatRequest;
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const vannaApiUrl = process.env.VANNA_API_BASE_URL || 'http://localhost:8000';
    const vannaApiKey = process.env.VANNA_API_KEY;

    const response = await fetch(`${vannaApiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(vannaApiKey && { 'Authorization': `Bearer ${vannaApiKey}` }),
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vanna API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to process query with Vanna AI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat with data error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat query' },
      { status: 500 }
    );
  }
}

