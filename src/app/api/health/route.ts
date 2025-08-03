import { NextResponse } from 'next/server';

export async function GET() {
  const serverTime = new Date();
  const uptime = process.uptime();
  
  return NextResponse.json({
    status: 'healthy',
    serverTime: serverTime.toISOString(),
    uptime: Math.floor(uptime),
    timestamp: Date.now(),
    message: 'Server executing code successfully'
  });
}