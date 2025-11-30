import { NextRequest, NextResponse } from "next/server";

const MCP_SERVER_URL =
  process.env.NEXT_PUBLIC_MCP_SERVER_URL || "http://localhost:4000";
const MCP_API_KEY = process.env.MCP_API_KEY || "dev-key";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Call MCP server agent endpoint
    const response = await fetch(`${MCP_SERVER_URL}/agent/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MCP_API_KEY,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("MCP server error:", errorData);
      return NextResponse.json(
        {
          error: "MCP server error",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
