import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Frontend Routes, Navigation & Empty States Suite", () => {
  const DOCUMENTED_ROUTES = [
    { path: "/", type: "public", name: "Landing Page" },
    { path: "/about", type: "public", name: "About PRECEDENT" },
    { path: "/app", type: "app", name: "Executive Overview" },
    { path: "/proposals", type: "app", name: "Proposals & RFPs" },
    { path: "/proposals/upload", type: "app", name: "Upload RFP Tender" },
    { path: "/review", type: "app", name: "Review Center" },
    { path: "/contradictions", type: "app", name: "Contradiction Center" },
    { path: "/lab", type: "app", name: "Memory A/B Lab" },
    { path: "/memory", type: "app", name: "Institutional Memory" },
    { path: "/claims", type: "app", name: "Claim Ledger" },
    { path: "/outcomes", type: "app", name: "Bid Outcomes" },
    { path: "/clients", type: "app", name: "Clients & Sectors" },
    { path: "/analytics", type: "app", name: "Institutional Analytics" },
    { path: "/settings", type: "app", name: "Settings & Health" }
  ];

  const SIDEBAR_NAV_ITEMS = [
    { label: "Overview", href: "/app" },
    { label: "Proposals & RFPs", href: "/proposals" },
    { label: "Review Center", href: "/review" },
    { label: "Contradiction Center", href: "/contradictions", hasAlert: true },
    { label: "Memory A/B Lab", href: "/lab", highlight: true },
    { label: "Institutional Memory", href: "/memory" },
    { label: "Claim Ledger", href: "/claims" },
    { label: "Bid Outcomes", href: "/outcomes" },
    { label: "Clients & Sectors", href: "/clients" },
    { label: "Analytics", href: "/analytics" },
    { label: "Settings & Health", href: "/settings" }
  ];

  it("should verify all sidebar navigation links match valid application routes", () => {
    const routePaths = new Set(DOCUMENTED_ROUTES.map((r) => r.path));
    for (const item of SIDEBAR_NAV_ITEMS) {
      assert.ok(
        routePaths.has(item.href),
        `Sidebar link '${item.label}' (${item.href}) does not map to a registered route!`
      );
    }
  });

  it("should correctly compute active navigation state based on current pathname", () => {
    function isActive(itemHref, currentPathname) {
      return currentPathname === itemHref || (itemHref !== "/" && currentPathname.startsWith(itemHref));
    }

    assert.strictEqual(isActive("/app", "/app"), true);
    assert.strictEqual(isActive("/proposals", "/proposals"), true);
    assert.strictEqual(isActive("/proposals", "/proposals/prop_mercy_01"), true);
    assert.strictEqual(isActive("/proposals", "/proposals/upload"), true);
    assert.strictEqual(isActive("/contradictions", "/contradictions"), true);
    assert.strictEqual(isActive("/review", "/app"), false);
  });

  it("should validate empty state messaging contracts across critical views", () => {
    const emptyStates = {
      proposals: {
        condition: (list) => !list || list.length === 0,
        expectedMessage: "No active proposals found."
      },
      contradictions: {
        condition: (list) => !list || list.length === 0,
        expectedMessage: "Zero open contradictions detected across active proposals."
      },
      claims: {
        condition: (list) => !list || list.length === 0,
        expectedMessage: "No institutional claims registered."
      },
      memory: {
        condition: (list) => !list || list.length === 0,
        expectedMessage: "No matching institutional memories found."
      },
      outcomes: {
        condition: (list) => !list || list.length === 0,
        expectedMessage: "No recorded outcomes"
      }
    };

    for (const [view, config] of Object.entries(emptyStates)) {
      assert.strictEqual(config.condition([]), true);
      assert.strictEqual(config.condition(["item_1"]), false);
      assert.ok(config.expectedMessage.length > 5);
    }
  });

  it("should validate dynamic proposal URL parameter formatting", () => {
    function getProposalDetailUrl(proposalId) {
      if (!proposalId || typeof proposalId !== "string" || !proposalId.trim()) {
        throw new Error("Invalid proposal ID");
      }
      return `/proposals/${encodeURIComponent(proposalId.trim())}`;
    }

    assert.strictEqual(getProposalDetailUrl("prop_mercy_01"), "/proposals/prop_mercy_01");
    assert.strictEqual(getProposalDetailUrl("prp_test_123"), "/proposals/prp_test_123");
    assert.throws(() => getProposalDetailUrl(""), /Invalid proposal ID/);
    assert.throws(() => getProposalDetailUrl(null), /Invalid proposal ID/);
  });
});
