/**
 * GitHub API Client Service
 *
 * Provides typed methods to interact with the GitHub REST API.
 * Uses GITHUB_TOKEN from environment variables for authentication.
 *
 * Usage (server-side only — token is never exposed to the client):
 *   import { github } from "@/services/github/client";
 *   const repos = await github.getUserRepos("username");
 */

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  language: string | null;
  updated_at: string;
  topics: string[];
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  body: string | null;
  created_at: string;
  updated_at: string;
  labels: Array<{ name: string; color: string }>;
}

interface CreateIssueInput {
  title: string;
  body?: string;
  labels?: string[];
}

interface CommitActivity {
  days: number[];
  total: number;
  week: number;
}

interface GitHubStats {
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  recentCommits: number;
}

/**
 * Fetch wrapper that includes GitHub token authentication
 */
async function githubFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error(
      "GITHUB_TOKEN is not configured. Add it in the Keys tab to enable GitHub integration."
    );
  }

  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "tts-anak-pintar",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `GitHub API error (${response.status}): ${(error as { message?: string }).message || response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * GitHub API client
 */
export const github = {
  /**
   * Get the authenticated user's profile
   */
  getAuthenticatedUser: (): Promise<GitHubUser> =>
    githubFetch("/user"),

  /**
   * Get a user's public profile
   */
  getUser: (username: string): Promise<GitHubUser> =>
    githubFetch(`/users/${encodeURIComponent(username)}`),

  /**
   * Get repositories for a user or organization
   */
  getUserRepos: (
    username: string,
    options?: { sort?: "updated" | "stars" | "name"; perPage?: number }
  ): Promise<GitHubRepo[]> => {
    const params = new URLSearchParams();
    if (options?.sort) params.set("sort", options.sort);
    if (options?.perPage) params.set("per_page", String(options.perPage));
    params.set("type", "owner");
    const qs = params.toString();
    return githubFetch(`/users/${encodeURIComponent(username)}/repos${qs ? `?${qs}` : ""}`);
  },

  /**
   * Get repository details
   */
  getRepo: (owner: string, repo: string): Promise<GitHubRepo> =>
    githubFetch(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`),

  /**
   * Get issues for a repository
   */
  getIssues: (
    owner: string,
    repo: string,
    options?: { state?: "open" | "closed" | "all"; perPage?: number }
  ): Promise<GitHubIssue[]> => {
    const params = new URLSearchParams();
    if (options?.state) params.set("state", options.state);
    if (options?.perPage) params.set("per_page", String(options.perPage));
    const qs = params.toString();
    return githubFetch(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues${qs ? `?${qs}` : ""}`);
  },

  /**
   * Create an issue in a repository
   */
  createIssue: (
    owner: string,
    repo: string,
    input: CreateIssueInput
  ): Promise<GitHubIssue> =>
    githubFetch(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),

  /**
   * Get the authenticated user's rate limit status
   */
  getRateLimit: (): Promise<{ resources: { core: { remaining: number; limit: number; reset: number } } }> =>
    githubFetch("/rate_limit"),

  /**
   * Get commit activity for the last year
   */
  getCommitActivity: (owner: string, repo: string): Promise<CommitActivity[]> =>
    githubFetch(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stats/commit_activity`),

  /**
   * Get combined stats for a repository
   */
  getRepoStats: async (owner: string, repo: string): Promise<GitHubStats> => {
    const repoData = await github.getRepo(owner, repo);
    const activity = await github.getCommitActivity(owner, repo).catch(() => []);

    const recentCommits = activity
      .slice(-4)
      .reduce((sum, week) => sum + week.total, 0);

    return {
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      openIssues: repoData.open_issues_count || 0,
      watchers: repoData.watchers_count || 0,
      recentCommits,
    };
  },
};

/**
 * Check if GitHub token is configured on the server
 */
export function isGitHubConfigured(): boolean {
  return !!process.env.GITHUB_TOKEN;
}
