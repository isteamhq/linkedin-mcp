import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { LinkedInClient } from "./client.js";

import {
  createPostSchema, createPost,
  createArticlePostSchema, createArticlePost,
  deletePostSchema, deletePost,
  commentOnPostSchema, commentOnPost,
  likePostSchema, likePost,
} from "./tools/engage.js";

import {
  getMeSchema, getMe,
  getPostSchema, getPost,
  getCommentsSchema, getComments,
  getOwnPostsSchema, getOwnPosts,
  getPostStatsSchema, getPostStats,
} from "./tools/info.js";

const server = new McpServer({ name: "linkedin", version: "1.0.0" });

let client: LinkedInClient;
function ensureClient(): LinkedInClient {
  if (!client) client = new LinkedInClient();
  return client;
}

// ─── Engage ──────────────────────────────────────────────────────

server.tool(
  "create_post",
  "Create a LinkedIn text post (max 3000 chars)",
  createPostSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await createPost(ensureClient(), createPostSchema.parse(args)) }],
  }),
);

server.tool(
  "create_article_post",
  "Share an article link on LinkedIn with commentary",
  createArticlePostSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await createArticlePost(ensureClient(), createArticlePostSchema.parse(args)) }],
  }),
);

server.tool(
  "delete_post",
  "Delete a LinkedIn post by URN",
  deletePostSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await deletePost(ensureClient(), deletePostSchema.parse(args)) }],
  }),
);

server.tool(
  "comment_on_post",
  "Comment on a LinkedIn post (max 1250 chars). Requires post URN — use WebSearch to find posts, then get_post to get the URN.",
  commentOnPostSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await commentOnPost(ensureClient(), commentOnPostSchema.parse(args)) }],
  }),
);

server.tool(
  "like_post",
  "Like/react to a LinkedIn post",
  likePostSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await likePost(ensureClient(), likePostSchema.parse(args)) }],
  }),
);

// ─── Info ────────────────────────────────────────────────────────

server.tool(
  "get_me",
  "Get authenticated LinkedIn user info",
  getMeSchema.shape,
  async () => ({
    content: [{ type: "text", text: await getMe(ensureClient()) }],
  }),
);

server.tool(
  "get_post",
  "Get a LinkedIn post by URN (text, author, stats)",
  getPostSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await getPost(ensureClient(), getPostSchema.parse(args)) }],
  }),
);

server.tool(
  "get_comments",
  "Get comments on a LinkedIn post",
  getCommentsSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await getComments(ensureClient(), getCommentsSchema.parse(args)) }],
  }),
);

server.tool(
  "get_own_posts",
  "Get your own recent LinkedIn posts",
  getOwnPostsSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await getOwnPosts(ensureClient(), getOwnPostsSchema.parse(args)) }],
  }),
);

server.tool(
  "get_post_stats",
  "Get like/comment counts for a LinkedIn post",
  getPostStatsSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await getPostStats(ensureClient(), getPostStatsSchema.parse(args)) }],
  }),
);

// ─── Start ───────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[linkedin-mcp] Server started");
}

main().catch((err) => {
  console.error("[linkedin-mcp] Fatal:", err);
  process.exit(1);
});
