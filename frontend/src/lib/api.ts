// Normalize API Base URL:
// 1. Server-side (SSR / Server Actions): Uses the Vercel internal service binding `PRECEDENT_API_URL`
// 2. Client-side (Browser): Uses the shared domain path `/api` (or NEXT_PUBLIC_API_URL if set)
// 3. Local standalone development: Falls back to http://localhost:8000/api
const isServer = typeof window === "undefined";
const rawBase = isServer
  ? (process.env.PRECEDENT_API_URL ? `${process.env.PRECEDENT_API_URL}/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"))
  : (process.env.NEXT_PUBLIC_API_URL || "/api");
const cleanBase = rawBase.trim().replace(/\/+$/, "");
const API_BASE = cleanBase.endsWith("/api") ? cleanBase : `${cleanBase}/api`;

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `HTTP Error ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    console.error(`API call failed for ${endpoint}:`, error);
    // Provide actionable advice for Render free-tier cold starts
    if (error?.message?.includes("Failed to fetch") || error?.name === "TypeError") {
      throw new Error("Unable to reach PRECEDENT API. If the service was recently idle, Render may take ~30-50s to wake from sleep.");
    }
    throw error;
  }
}

export const api = {
  getHealth: () => fetchApi("/health"),
  getProposals: () => fetchApi("/proposals"),
  getProposalDetail: (id: string) => fetchApi(`/proposals/${id}`),
  createProposal: (data: any) => fetchApi("/proposals", { method: "POST", body: JSON.stringify(data) }),
  
  ingestRfp: async (formData: FormData) => {
    const res = await fetch(`${API_BASE}/rfp/ingest`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Upload failed with status ${res.status}`);
    }
    return await res.json();
  },

  generateResponse: (proposalId: string, questionId: string, generationMode: string = "MEMORY_ON") =>
    fetchApi("/proposals/generate-response", {
      method: "POST",
      body: JSON.stringify({ proposal_id: proposalId, question_id: questionId, generation_mode: generationMode })
    }),

  submitReviewCorrection: (data: {
    response_id: string;
    question_id: string;
    proposal_id: string;
    original_answer: string;
    corrected_answer: string;
    correction_reason: string;
    category_tag: string;
    reviewer_name?: string;
    retain_in_hindsight?: boolean;
  }) => fetchApi("/review/correct", { method: "POST", body: JSON.stringify(data) }),

  acceptResponse: (responseId: string) => fetchApi(`/review/accept/${responseId}`, { method: "POST" }),

  getMemories: (params?: { topic?: string; client_id?: string; sector_id?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchApi(`/memory/explorer${query ? `?${query}` : ""}`);
  },

  retainMemory: (content: string, category: string, metadata: any = {}) =>
    fetchApi("/memory/retain", {
      method: "POST",
      body: JSON.stringify({ content, context: "manual_entry", tags: [category], metadata })
    }),

  recallMemories: (query: string, limit: number = 5) =>
    fetchApi("/memory/recall", { method: "POST", body: JSON.stringify({ query, limit }) }),

  reflectMemories: (query: string) =>
    fetchApi("/memory/reflect", { method: "POST", body: JSON.stringify({ query }) }),

  getContradictions: (status?: string) =>
    fetchApi(`/contradictions${status ? `?status=${status}` : ""}`),

  resolveContradiction: (alertId: string, resolutionType: string, reason: string, resolvedBy: string = "Lead Architect") =>
    fetchApi(`/contradictions/${alertId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolution_type: resolutionType, reason, resolved_by: resolvedBy })
    }),

  getClaims: () => fetchApi("/claims"),
  createClaim: (data: any) => fetchApi("/claims", { method: "POST", body: JSON.stringify(data) }),

  getOutcomes: () => fetchApi("/outcomes"),
  recordOutcome: (data: any) => fetchApi("/outcomes", { method: "POST", body: JSON.stringify(data) }),

  executeComparison: (proposalId: string, questionId: string) =>
    fetchApi("/comparison/execute", {
      method: "POST",
      body: JSON.stringify({ proposal_id: proposalId, question_id: questionId })
    }),

  getAnalyticsSummary: () => fetchApi("/analytics/summary"),
  submitProposal: (proposalId: string) => fetchApi(`/proposals/${proposalId}/submit`, { method: "POST" }),
  getContradictionAuditTrail: (proposalId?: string) =>
    fetchApi(`/contradictions/audit-trail${proposalId ? `?proposal_id=${proposalId}` : ""}`),
  getClients: () => fetchApi("/clients"),
  getSectors: () => fetchApi("/sectors"),
  getCompanyProfile: () => fetchApi("/company-profile"),
  seedDatabase: (force: boolean = false) => fetchApi(`/seed?force=${force}`, { method: "POST" })
};

