const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const ticketsApi = {
  getAll: (params = {}) => { const qs = new URLSearchParams(params).toString(); return request(`/tickets${qs ? "?" + qs : ""}`); },
  getById: (id) => request(`/tickets/${id}`),
  create: (data) => request("/tickets", { method: "POST", body: data }),
  update: (id, changes) => request(`/tickets/${id}`, { method: "PATCH", body: changes }),
  delete: (id) => request(`/tickets/${id}`, { method: "DELETE" }),
  addComment: (id, data) => request(`/tickets/${id}/comments`, { method: "POST", body: data }),
};

export const aiApi = {
  triage: (title, description) => request("/ai/triage", { method: "POST", body: { title, description } }),
  chat: (messages) => request("/ai/chat", { method: "POST", body: { messages } }),
  ticketChat: (id, messages) => request(`/ai/ticket-chat/${id}`, { method: "POST", body: { messages } }),
  kbSearch: (query) => request("/ai/kb-search", { method: "POST", body: { query } }),
  summarize: (id) => request(`/ai/summarize/${id}`, { method: "POST" }),
};

export const statsApi = { get: () => request("/stats") };
export const kbApi = { getAll: () => request("/kb"), getById: (id) => request(`/kb/${id}`) };
