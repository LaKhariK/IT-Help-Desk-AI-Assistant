const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const tickets = [
  { id: "INC0001", title: "Laptop won't boot after Windows update", description: "Blue screen after update. Error: CRITICAL_PROCESS_DIED.", category: "Hardware", priority: "High", status: "In Progress", assignee: "Tier 2", reporter: "John Smith", created: "2026-06-07T09:15:00Z", updated: "2026-06-08T14:30:00Z", comments: [], aiSummary: null },
  { id: "INC0002", title: "VPN not connecting from home", description: "Cannot connect to VPN. Error: authentication failed.", category: "Network", priority: "Critical", status: "Open", assignee: "Unassigned", reporter: "Maria Garcia", created: "2026-06-08T07:45:00Z", updated: "2026-06-08T07:45:00Z", comments: [], aiSummary: null },
  { id: "INC0003", title: "Need access to SharePoint Marketing site", description: "Requesting read access to Marketing SharePoint.", category: "Access", priority: "Low", status: "Resolved", assignee: "Tier 1", reporter: "David Chen", created: "2026-06-06T11:00:00Z", updated: "2026-06-07T09:00:00Z", comments: [], aiSummary: null },
  { id: "INC0004", title: "Outlook keeps crashing when sending attachments", description: "Outlook 365 crashes on send with attachments > 5MB.", category: "Software", priority: "Medium", status: "Open", assignee: "Unassigned", reporter: "Sarah Johnson", created: "2026-06-09T08:00:00Z", updated: "2026-06-09T08:00:00Z", comments: [], aiSummary: null },
  { id: "INC0005", title: "Printer offline in Building B, Floor 3", description: "HP LaserJet shows offline for all users on floor 3.", category: "Hardware", priority: "Medium", status: "Closed", assignee: "Tier 1", reporter: "Facilities", created: "2026-06-05T13:30:00Z", updated: "2026-06-06T10:15:00Z", comments: [], aiSummary: null },
];

let counter = tickets.length + 1;

router.get("/", (req, res) => {
  let result = [...tickets].sort((a, b) => new Date(b.created) - new Date(a.created));
  const { status, priority, category, search } = req.query;
  if (status && status !== "All") result = result.filter(t => t.status === status);
  if (priority && priority !== "All") result = result.filter(t => t.priority === priority);
  if (category && category !== "All") result = result.filter(t => t.category === category);
  if (search) { const q = search.toLowerCase(); result = result.filter(t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)); }
  res.json({ tickets: result, total: result.length });
});

router.get("/:id", (req, res) => {
  const t = tickets.find(t => t.id === req.params.id);
  if (!t) return res.status(404).json({ error: "Ticket not found" });
  res.json(t);
});

router.post("/", (req, res) => {
  const { title, description, category, priority, reporter, aiSummary } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });
  const ticket = { id: `INC${String(counter++).padStart(4, "0")}`, title, description: description || "", category: category || "Other", priority: priority || "Medium", status: "Open", assignee: "Unassigned", reporter: reporter || "Portal", created: new Date().toISOString(), updated: new Date().toISOString(), comments: [], aiSummary: aiSummary || null };
  tickets.unshift(ticket);
  res.status(201).json(ticket);
});

router.patch("/:id", (req, res) => {
  const idx = tickets.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Ticket not found" });
  const allowed = ["title", "description", "status", "priority", "category", "assignee", "aiSummary"];
  allowed.forEach(k => { if (req.body[k] !== undefined) tickets[idx][k] = req.body[k]; });
  tickets[idx].updated = new Date().toISOString();
  res.json(tickets[idx]);
});

router.delete("/:id", (req, res) => {
  const idx = tickets.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Ticket not found" });
  tickets.splice(idx, 1);
  res.json({ success: true });
});

router.post("/:id/comments", (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  const comment = { id: uuidv4(), author: req.body.author || "Agent", text: req.body.text, created: new Date().toISOString() };
  ticket.comments.push(comment);
  ticket.updated = new Date().toISOString();
  res.status(201).json(comment);
});

module.exports = router;
