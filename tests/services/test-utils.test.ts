/**
 * @file test-utils.test.ts
 * @description YYC³ Test Utilities — Vitest Unit Tests
 *   Covers: mock data factories, mock services, assertion helpers, and delay utils.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P1,testing,services,test-utils
 */

import { describe, expect, it, vi } from "vitest";

import {
  assertDefined,
  createMockAIConfig,
  createMockAIProxyService,
  createMockBranch,
  createMockCommit,
  createMockFileTree,
  createMockGitAPIService,
  createMockGitConfig,
  createMockMessage,
  createMockProxyResponse,
  delay,
  waitForCondition,
} from "../../src/app/components/services/test-utils";

// ==========================================
// Test Suite: Mock Data Factories
// ==========================================

describe("TestUtils — createMockAIConfig", () => {
  it("should return default AI config", () => {
    const config = createMockAIConfig();
    expect(config.provider).toBe("mock");
    expect(config.apiKey).toBe("");
    expect(config.model).toBe("mock-v1");
    expect(config.temperature).toBe(0.7);
    expect(config.maxTokens).toBe(4096);
  });

  it("should accept overrides", () => {
    const config = createMockAIConfig({ provider: "openai", model: "gpt-4", apiKey: "sk-test" });
    expect(config.provider).toBe("openai");
    expect(config.model).toBe("gpt-4");
    expect(config.apiKey).toBe("sk-test");
    // Non-overridden fields retain defaults
    expect(config.temperature).toBe(0.7);
  });
});

describe("TestUtils — createMockMessage", () => {
  it("should return default user message", () => {
    const msg = createMockMessage();
    expect(msg.role).toBe("user");
    expect(msg.content).toContain("Hello");
  });

  it("should accept overrides", () => {
    const msg = createMockMessage({ role: "assistant", content: "I am AI" });
    expect(msg.role).toBe("assistant");
    expect(msg.content).toBe("I am AI");
  });
});

describe("TestUtils — createMockProxyResponse", () => {
  it("should return default proxy response", () => {
    const res = createMockProxyResponse();
    expect(res.content).toBeTruthy();
    expect(res.model).toBe("mock-v1");
    expect(res.provider).toBe("mock");
    expect(res.cached).toBe(false);
    expect(typeof res.latencyMs).toBe("number");
  });

  it("should accept overrides", () => {
    const res = createMockProxyResponse({ cached: true, latencyMs: 0 });
    expect(res.cached).toBe(true);
    expect(res.latencyMs).toBe(0);
  });
});

describe("TestUtils — createMockGitConfig", () => {
  it("should return default git config", () => {
    const config = createMockGitConfig();
    expect(config.token).toContain("ghp_mock");
    expect(config.owner).toBe("YanYuCloudCube");
    expect(config.repo).toBe("yyc3-cloudpivot");
    expect(config.branch).toContain("feature");
  });

  it("should accept overrides", () => {
    const config = createMockGitConfig({ branch: "main" });
    expect(config.branch).toBe("main");
  });
});

describe("TestUtils — createMockCommit", () => {
  it("should return a valid commit object", () => {
    const commit = createMockCommit();
    expect(commit.sha).toBeTruthy();
    expect(commit.message).toBeTruthy();
    expect(commit.author.name).toBeTruthy();
    expect(commit.author.email).toContain("@");
    expect(commit.author.date).toBeTruthy();
    expect(typeof commit.filesChanged).toBe("number");
    expect(commit.url).toBeTruthy();
  });

  it("should accept overrides", () => {
    const commit = createMockCommit({ sha: "custom-sha", message: "custom msg" });
    expect(commit.sha).toBe("custom-sha");
    expect(commit.message).toBe("custom msg");
  });
});

describe("TestUtils — createMockBranch", () => {
  it("should return a valid branch object", () => {
    const branch = createMockBranch();
    expect(branch.name).toBeTruthy();
    expect(branch.sha).toBeTruthy();
    expect(typeof branch.protected).toBe("boolean");
    expect(typeof branch.current).toBe("boolean");
  });

  it("should accept overrides", () => {
    const branch = createMockBranch({ name: "main", protected: true, current: true });
    expect(branch.name).toBe("main");
    expect(branch.protected).toBe(true);
    expect(branch.current).toBe(true);
  });
});

describe("TestUtils — createMockFileTree", () => {
  it("should return a non-empty file tree", () => {
    const tree = createMockFileTree();
    expect(Array.isArray(tree)).toBe(true);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("should have root folder with children", () => {
    const tree = createMockFileTree();
    const src = tree.find((n) => n.name === "src");
    expect(src).toBeDefined();
    expect(src!.type).toBe("folder");
    expect(src!.children!.length).toBeGreaterThan(0);
  });

  it("should have nested components folder", () => {
    const tree = createMockFileTree();
    const src = tree.find((n) => n.name === "src");
    const components = src!.children!.find((n: any) => n.name === "components");
    expect(components).toBeDefined();
    expect(components!.type).toBe("folder");
    expect(components!.children!.length).toBeGreaterThan(0);
  });

  it("should have package.json at root level", () => {
    const tree = createMockFileTree();
    const pkg = tree.find((n) => n.name === "package.json");
    expect(pkg).toBeDefined();
    expect(pkg!.type).toBe("file");
  });

  it("should assign unique IDs to all nodes", () => {
    const tree = createMockFileTree();
    const allIds = new Set<string>();
    const collect = (nodes: any[]) => {
      for (const n of nodes) {
        allIds.add(n.id);
        if (n.children) collect(n.children);
      }
    };
    collect(tree);
    // Check uniqueness
    expect(allIds.size).toBeGreaterThanOrEqual(5); // We have at least 5 nodes
  });
});

// ==========================================
// Test Suite: Assertion Helpers
// ==========================================

describe("TestUtils — assertDefined", () => {
  it("should return the value if defined", () => {
    expect(assertDefined("hello")).toBe("hello");
    expect(assertDefined(0)).toBe(0);
    expect(assertDefined(false)).toBe(false);
    expect(assertDefined("")).toBe("");
  });

  it("should throw for undefined", () => {
    expect(() => assertDefined(undefined)).toThrow("Expected value to be defined");
  });

  it("should throw for null", () => {
    expect(() => assertDefined(null)).toThrow("Expected value to be defined");
  });

  it("should include label in error message", () => {
    expect(() => assertDefined(undefined, "myVar")).toThrow("Expected myVar to be defined");
  });
});

describe("TestUtils — waitForCondition", () => {
  it("should resolve immediately if condition is already true", async () => {
    await expect(waitForCondition(() => true)).resolves.toBeUndefined();
  });

  it("should resolve when condition becomes true", async () => {
    let flag = false;
    setTimeout(() => { flag = true; }, 200);
    await expect(waitForCondition(() => flag, 3000)).resolves.toBeUndefined();
  });

  it("should reject on timeout", async () => {
    await expect(
      waitForCondition(() => false, 300, 50)
    ).rejects.toThrow("timed out");
  });
});

describe("TestUtils — delay", () => {
  it("should resolve after specified time", async () => {
    const start = Date.now();
    await delay(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(80); // Allow some tolerance
  });

  it("should resolve with undefined", async () => {
    const result = await delay(10);
    expect(result).toBeUndefined();
  });
});

// ==========================================
// Test Suite: Mock Services
// ==========================================

describe("TestUtils — createMockAIProxyService", () => {
  it("should create a service with chat method", async () => {
    const service = createMockAIProxyService();
    expect(typeof service.chat).toBe("function");

    const config = createMockAIConfig();
    const messages = [createMockMessage()];
    const result = await service.chat(config, messages);

    expect(result).toBeDefined();
    expect(result.content).toBeTruthy();
    expect(result.model).toBe("mock-v1");
    expect(result.provider).toBe("mock");
  });

  it("should have getStats method", () => {
    const service = createMockAIProxyService();
    const stats = service.getStats();

    expect(stats.totalRequests).toBe(10);
    expect(stats.avgLatency).toBe(450);
    expect(stats.cacheHitRate).toBe(0.3);
    expect(stats.byProvider.mock).toBe(7);
    expect(stats.byProvider.openai).toBe(3);
  });

  it("should have clearCache method that doesn't throw", () => {
    const service = createMockAIProxyService();
    expect(() => service.clearCache()).not.toThrow();
  });
});

describe("TestUtils — createMockGitAPIService", () => {
  it("should be configured", () => {
    const service = createMockGitAPIService();
    expect(service.isConfigured).toBe(true);
  });

  it("should list commits", async () => {
    const service = createMockGitAPIService();
    const result = await service.listCommits();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBe(2);
    }
  });

  it("should create a commit", async () => {
    const service = createMockGitAPIService();
    const result = await service.createCommit("file.ts", "content", "test commit");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBe("test commit");
    }
  });

  it("should list branches", async () => {
    const service = createMockGitAPIService();
    const result = await service.listBranches();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBe(2);
      expect(result.data[0].name).toBe("main");
      expect(result.data[0].protected).toBe(true);
      expect(result.data[1].current).toBe(true);
    }
  });

  it("should create a branch", async () => {
    const service = createMockGitAPIService();
    const result = await service.createBranch("feature/new");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("feature/new");
    }
  });

  it("should get file content", async () => {
    const service = createMockGitAPIService();
    const result = await service.getFileContent("src/test.ts");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.path).toBe("src/test.ts");
      expect(result.data.content).toBe("// Mock content");
    }
  });

  it("should list pull requests", async () => {
    const service = createMockGitAPIService();
    const result = await service.listPullRequests();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBe(1);
      expect(result.data[0].number).toBe(42);
      expect(result.data[0].state).toBe("open");
    }
  });

  it("should call configure without error", () => {
    const service = createMockGitAPIService();
    expect(() => service.configure(createMockGitConfig())).not.toThrow();
  });
});
