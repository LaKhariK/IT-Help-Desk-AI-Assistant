const express = require("express");
const router = express.Router();
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-20250514";

router.post("/triage", async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  try {
    const msg = await client.messages.create({
      model: MODEL, max_tokens: 600,
      system: `You are an IT triage AI. Respond ONLY with valid JSON, no markdown:
{"category":"Hardware|Software|Network|Access|Other","priority":"Critical|High|Medium|Low","summary":"one sentence","suggestedSteps":["step1","step2","step3"],"estimatedResolutionTime":"e.g. 30 minutes"}`,
      messages: [{ role: "user", content: `Title: ${title}\nDescription: ${description || ""}` }],
    });
    const parsed = JSON.parse(msg.content[0].text.replace(/```json|```/g, "").trim());
    res.json(parsed);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: "messages required" });
  try {
    const msg = await client.messages.create({
      model: MODEL, max_tokens: 1000,
      system: "You are an expert IT Help Desk assistant. Be concise and provide step-by-step troubleshooting.",
      messages: messages.filter(m => m.role && m.content).map(m => ({ role: m.role, content: String(m.content) })),
    });
    res.json({ reply: msg.content.map(b => b.text || "").join("") });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/ticket-chat/:id", async (req, res) => {
  const tickets = require("./tickets");
  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: "messages required" });
  try {
    const msg = await client.messages.create({
      model: MODEL, max_tokens: 1000,
      system: `You are an IT Help Desk AI for ticket ${req.params.id}. Be technical and actionable.`,
      messages: messages.filter(m => m.role && m.content).map(m => ({ role: m.role, content: String(m.content) })),
    });
    res.json({ reply: msg.content.map(b => b.text || "").join("") });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/kb-search", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "query required" });
  try {
    const msg = await client.messages.create({
      model: MODEL, max_tokens: 1000,
      system: "You are an enterprise IT knowledge base assistant. Answer clearly with numbered steps.",
      messages: [{ role: "user", content: query }],
    });
    res.json({ answer: msg.content.map(b => b.text || "").join("") });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/summarize/:id", async (req, res) => {
  try {
    const msg = await client.messages.create({
      model: MODEL, max_tokens: 400,
      system: "Summarize this IT ticket in 2-3 sentences: what the issue is, current status, and next steps.",
      messages: [{ role: "user", content: `Ticket ID: ${req.params.id}` }],
    });
    res.json({ aiSummary: msg.content[0].text.trim() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
