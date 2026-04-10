const API_BASE = "https://api.linkedin.com";

interface TokenInfo {
  accessToken: string;
  personId: string;
  organizationId?: string;
  mode: "member" | "organization";
}

export interface PostView {
  id: string;
  text: string;
  author: string;
  authorName?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
}

export interface CommentView {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface ProfileView {
  sub: string;
  name: string;
  email?: string;
  picture?: string;
}

export class LinkedInClient {
  private token: TokenInfo;

  constructor() {
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    const personId = process.env.LINKEDIN_PERSON_ID;
    const organizationId = process.env.LINKEDIN_ORGANIZATION_ID;
    const mode = (process.env.LINKEDIN_MODE ?? "member") as "member" | "organization";

    if (!accessToken) {
      throw new Error("Missing LINKEDIN_ACCESS_TOKEN. Run OAuth flow first: GET /api/integrations/linkedin/authorize");
    }
    if (!personId && mode === "member") {
      throw new Error("Missing LINKEDIN_PERSON_ID. Get it from /v2/userinfo after OAuth.");
    }

    this.token = {
      accessToken,
      personId: personId ?? "",
      organizationId,
      mode,
    };
  }

  private get authorUrn(): string {
    return this.token.mode === "organization" && this.token.organizationId
      ? `urn:li:organization:${this.token.organizationId}`
      : `urn:li:person:${this.token.personId}`;
  }

  private async get(path: string, params?: Record<string, string>): Promise<unknown> {
    const url = new URL(`${API_BASE}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.token.accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202602",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`LinkedIn API ${res.status}: ${body}`);
    }
    return res.json();
  }

  private async post(path: string, body: unknown): Promise<Response> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202602",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`LinkedIn API ${res.status}: ${text}`);
    }
    return res;
  }

  // ─── Public API ────────────────────────────────────────────────

  /** Get authenticated user info */
  async getMe(): Promise<ProfileView> {
    const data = (await this.get("/v2/userinfo")) as ProfileView;
    return data;
  }

  /** Create a text post */
  async createPost(text: string): Promise<string> {
    const body = {
      author: this.authorUrn,
      commentary: text,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
    };

    const res = await this.post("/rest/posts", body);
    return res.headers.get("x-restli-id") ?? "unknown";
  }

  /** Create a post with an article link */
  async createArticlePost(
    text: string,
    articleUrl: string,
    articleTitle?: string,
    articleDescription?: string,
  ): Promise<string> {
    const body = {
      author: this.authorUrn,
      commentary: text,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      content: {
        article: {
          source: articleUrl,
          title: articleTitle ?? "",
          description: articleDescription ?? "",
        },
      },
    };

    const res = await this.post("/rest/posts", body);
    return res.headers.get("x-restli-id") ?? "unknown";
  }

  /** Delete a post by URN */
  async deletePost(postUrn: string): Promise<void> {
    const encoded = encodeURIComponent(postUrn);
    const res = await fetch(`${API_BASE}/rest/posts/${encoded}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.token.accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202602",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`LinkedIn API ${res.status}: ${text}`);
    }
  }

  /** Comment on a post */
  async commentOnPost(postUrn: string, text: string): Promise<string> {
    const body = {
      actor: this.authorUrn,
      object: postUrn,
      message: { text },
    };

    const res = await this.post("/rest/socialActions/" + encodeURIComponent(postUrn) + "/comments", body);
    const data = (await res.json()) as { id?: string };
    return data.id ?? "unknown";
  }

  /** Like/react to a post */
  async likePost(postUrn: string): Promise<void> {
    const body = {
      actor: this.authorUrn,
      object: postUrn,
    };

    // Use the reactions endpoint
    await this.post("/rest/reactions", {
      ...body,
      reactionType: "LIKE",
    });
  }

  /** Get own posts (member feed) */
  async getOwnPosts(count = 10): Promise<PostView[]> {
    const authorUrn = this.authorUrn;
    const data = (await this.get("/rest/posts", {
      author: authorUrn,
      q: "author",
      count: count.toString(),
      sortBy: "LAST_MODIFIED",
    })) as { elements?: Array<{ id: string; commentary: string; createdAt: number; lifeActivity?: unknown }> };

    return (data.elements ?? []).map((e) => ({
      id: e.id,
      text: e.commentary ?? "",
      author: authorUrn,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      createdAt: new Date(e.createdAt).toISOString(),
    }));
  }

  /** Search posts (requires r_organization_social or marketing API access) */
  async searchPosts(query: string, count = 10): Promise<PostView[]> {
    // LinkedIn doesn't have a public post search API like Twitter/Bluesky.
    // The best we can do is search for content via the marketing API or
    // use the content suggestion API. For now, return a helpful error.
    throw new Error(
      "LinkedIn doesn't offer a public post search API. " +
      "Use WebSearch to find LinkedIn posts, then use get_post with the URN to interact. " +
      "Or search people/companies and check their feeds.",
    );
  }

  /** Search people */
  async searchPeople(keywords: string, count = 10): Promise<Array<{ name: string; headline?: string; urn: string }>> {
    // Requires r_liteprofile which is restricted. Use basic lookup instead.
    throw new Error(
      "LinkedIn people search requires special API access (not available on basic apps). " +
      "Use WebSearch to find LinkedIn profiles, then interact via post URNs.",
    );
  }

  /** Get a specific post by URN */
  async getPost(postUrn: string): Promise<{ id: string; text: string; author: string }> {
    const encoded = encodeURIComponent(postUrn);
    const data = (await this.get(`/rest/posts/${encoded}`)) as {
      id: string;
      commentary: string;
      author: string;
    };
    return { id: data.id, text: data.commentary, author: data.author };
  }

  /** Get comments on a post */
  async getComments(postUrn: string, count = 10): Promise<CommentView[]> {
    const encoded = encodeURIComponent(postUrn);
    const data = (await this.get(`/rest/socialActions/${encoded}/comments`, {
      count: count.toString(),
    })) as { elements?: Array<{ id: string; actor: string; message: { text: string }; created: { time: number } }> };

    return (data.elements ?? []).map((e) => ({
      id: e.id,
      text: e.message?.text ?? "",
      author: e.actor,
      createdAt: new Date(e.created?.time).toISOString(),
    }));
  }

  /** Get social actions (likes, comments count) for a post */
  async getPostStats(postUrn: string): Promise<{ likes: number; comments: number }> {
    const encoded = encodeURIComponent(postUrn);
    const data = (await this.get(`/rest/socialActions/${encoded}`)) as {
      likesSummary?: { totalLikes: number };
      commentsSummary?: { totalFirstLevelComments: number };
    };
    return {
      likes: data.likesSummary?.totalLikes ?? 0,
      comments: data.commentsSummary?.totalFirstLevelComments ?? 0,
    };
  }
}
