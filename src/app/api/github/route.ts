/**
 * API Route — GitHub Integration Proxy
 *
 * Server-side proxy for GitHub API calls.
 * Keeps GITHUB_TOKEN server-side, never exposed to the client.
 * Provides typed endpoints for common GitHub operations.
 */

import { NextRequest, NextResponse } from "next/server";
import { github, isGitHubConfigured } from "@/services/github/client";

/**
 * GET /api/github
 *
 * Query params:
 *   - action: "user" | "repos" | "repo" | "issues" | "stats"
 *   - username: GitHub username (for user/repos actions)
 *   - owner: repo owner (for repo/issues/stats actions)
 *   - repo: repo name (for repo/issues/stats actions)
 */
export async function GET(request: NextRequest) {
  if (!isGitHubConfigured()) {
    return NextResponse.json(
      { error: "GitHub token not configured. Add GITHUB_TOKEN to your environment variables." },
      { status: 400 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "user": {
        const username = searchParams.get("username");
        if (!username) {
          return NextResponse.json({ error: "username is required" }, { status: 400 });
        }
        const user = await github.getUser(username);
        return NextResponse.json(user);
      }

      case "repos": {
        const username = searchParams.get("username");
        const sort = searchParams.get("sort") as "updated" | "stars" | "name" | undefined;
        if (!username) {
          return NextResponse.json({ error: "username is required" }, { status: 400 });
        }
        const repos = await github.getUserRepos(username, { sort, perPage: 20 });
        return NextResponse.json(repos);
      }

      case "repo": {
        const owner = searchParams.get("owner");
        const repo = searchParams.get("repo");
        if (!owner || !repo) {
          return NextResponse.json({ error: "owner and repo are required" }, { status: 400 });
        }
        const repoData = await github.getRepo(owner, repo);
        return NextResponse.json(repoData);
      }

      case "issues": {
        const owner = searchParams.get("owner");
        const repo = searchParams.get("repo");
        const state = searchParams.get("state") as "open" | "closed" | "all" | undefined;
        if (!owner || !repo) {
          return NextResponse.json({ error: "owner and repo are required" }, { status: 400 });
        }
        const issues = await github.getIssues(owner, repo, { state });
        return NextResponse.json(issues);
      }

      case "stats": {
        const owner = searchParams.get("owner");
        const repo = searchParams.get("repo");
        if (!owner || !repo) {
          return NextResponse.json({ error: "owner and repo are required" }, { status: 400 });
        }
        const stats = await github.getRepoStats(owner, repo);
        return NextResponse.json(stats);
      }

      case "rate-limit": {
        const rateLimit = await github.getRateLimit();
        return NextResponse.json(rateLimit);
      }

      default: {
        // Return integration status
        return NextResponse.json({
          configured: true,
          message: "GitHub API is configured and ready.",
          endpoints: [
            "/api/github?action=user&username=...",
            "/api/github?action=repos&username=...&sort=stars",
            "/api/github?action=repo&owner=...&repo=...",
            "/api/github?action=issues&owner=...&repo=...&state=open",
            "/api/github?action=stats&owner=...&repo=...",
            "/api/github?action=rate-limit",
          ],
        });
      }
    }
  } catch (error) {
    console.error("GitHub API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
