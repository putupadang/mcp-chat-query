#!/usr/bin/env node
/*
 Simple LLM simulator agent for MCP Portfolio
 - Reads a user prompt
 - Decides which tool(s) to call on the server
 - Calls POST /invoke with x-api-key
 - Combines tool results and produces a final answer
 - If OPENAI_API_KEY is set, uses OpenAI Chat to synthesize an answer; otherwise uses a simple template

 Usage:
   MCP_API_KEY=... MCP_SERVER_URL=http://localhost:4000 node agent.js "Find laptop details"
*/

const fs = require("fs");
const path = require("path");

const SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:4000";
const API_KEY = process.env.MCP_API_KEY || readServerApiKey();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

function readServerApiKey() {
  try {
    const envPath = path.join(__dirname, "server", ".env");
    const content = fs.readFileSync(envPath, "utf-8");
    const m = content.match(/APP_API_KEY=(.*)/);
    return m ? m[1].trim() : "";
  } catch (_) {
    return "";
  }
}

async function invokeTool(tool, input) {
  const res = await fetch(`${SERVER_URL}/invoke`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({ tool, input }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Invoke failed: ${res.status} ${txt}`);
  }
  return res.json();
}

function detectIntent(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes("ticket") || p.includes("support")) return "create_ticket";
  if (
    p.includes("search") ||
    p.includes("find") ||
    p.includes("price") ||
    p.includes("laptop")
  )
    return "search_db";
  return "rag_query";
}

function extractQuery(prompt) {
  return prompt.replace(/^(search|find)\s*/i, "").trim() || prompt.trim();
}

async function synthesizeFinal(prompt, contexts) {
  if (!OPENAI_API_KEY) {
    const lines = [];
    lines.push(`User: ${prompt}`);
    lines.push("");
    lines.push("Context:");
    for (const c of contexts) {
      lines.push(`- ${c}`);
    }
    lines.push("");
    lines.push("Answer (heuristic):");
    lines.push(
      "Based on the retrieved context above, here is a concise answer:"
    );
    return lines.join("\n");
  }
  const system =
    "You are a helpful assistant. Use ONLY the provided context to answer. If something is unknown, say so briefly.";
  const contextText = contexts.map((c, i) => `(${i + 1}) ${c}`).join("\n");
  const messages = [
    { role: "system", content: system },
    {
      role: "user",
      content: `Question: ${prompt}\n\nContext:\n${contextText}`,
    },
  ];
  // Use the REST API to avoid extra deps
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response";
}

async function main() {
  const prompt = process.argv.slice(2).join(" ").trim();
  if (!prompt) {
    console.error('Usage: node agent.js "your prompt"');
    process.exit(1);
  }
  if (!API_KEY) {
    console.error(
      "Missing MCP_API_KEY. Set env MCP_API_KEY or ensure server/.env contains APP_API_KEY."
    );
    process.exit(1);
  }

  const contexts = [];

  // Always try to get some RAG context first
  try {
    const q = extractQuery(prompt);
    const rag = await invokeTool("rag_query", { query: q, topK: 3 });
    const ctx =
      rag?.result?.context ||
      rag?.result?.results?.map((r) => r.content).join("\n") ||
      "";
    if (ctx) contexts.push(`RAG:\n${ctx}`);
  } catch (e) {
    // ignore rag errors for robustness
  }

  const intent = detectIntent(prompt);
  if (intent === "search_db") {
    try {
      const q = extractQuery(prompt);
      const r = await invokeTool("search_db", { q, limit: 5 });
      const hits = r?.result?.hits || [];
      if (hits.length) {
        const lines = hits.map(
          (h) => `${h.name} (${h.category}) - $${h.price}`
        );
        contexts.push(`Search results:\n${lines.join("\n")}`);
      }
    } catch (e) {
      contexts.push(`Search error: ${e.message}`);
    }
  } else if (intent === "create_ticket") {
    try {
      const title = prompt.length > 80 ? prompt.slice(0, 77) + "..." : prompt;
      const r = await invokeTool("create_ticket", {
        title,
        body: prompt,
        priority: "medium",
      });
      const id = r?.result?.ticket?.id || "TICKET-ID";
      contexts.push(`Ticket created: ${id}`);
    } catch (e) {
      contexts.push(`Create ticket error: ${e.message}`);
    }
  }

  const final = await synthesizeFinal(prompt, contexts);
  console.log("\n=== Agent Answer ===\n");
  console.log(final);
  console.log("\n=== Tool Context Used ===");
  for (const c of contexts) console.log(`\n${c}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
