import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    app: "D_Show Frontend",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}

