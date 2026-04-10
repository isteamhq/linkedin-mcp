import { z } from "zod";
import type { LinkedInClient } from "../client.js";

export const getMeSchema = z.object({});

export async function getMe(client: LinkedInClient): Promise<string> {
  const me = await client.getMe();
  const lines = [
    `${me.name}`,
    `ID: ${me.sub}`,
    me.email ? `Email: ${me.email}` : "",
    me.picture ? `Photo: ${me.picture}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

export const getPostSchema = z.object({
  post_urn: z.string().describe("URN of the post (e.g. urn:li:share:123456 or urn:li:ugcPost:123456)"),
});

export async function getPost(
  client: LinkedInClient,
  args: z.infer<typeof getPostSchema>,
): Promise<string> {
  const post = await client.getPost(args.post_urn);
  const stats = await client.getPostStats(args.post_urn).catch(() => ({ likes: 0, comments: 0 }));
  const lines = [
    `Post: ${post.id}`,
    `Author: ${post.author}`,
    "",
    post.text,
    "",
    `❤️ ${stats.likes}  💬 ${stats.comments}`,
  ];
  return lines.join("\n");
}

export const getCommentsSchema = z.object({
  post_urn: z.string().describe("URN of the post to get comments for"),
  count: z.number().min(1).max(50).default(10).describe("Number of comments to fetch"),
});

export async function getComments(
  client: LinkedInClient,
  args: z.infer<typeof getCommentsSchema>,
): Promise<string> {
  const comments = await client.getComments(args.post_urn, args.count);
  if (comments.length === 0) return "No comments.";

  const lines: string[] = [];
  for (const c of comments) {
    lines.push(`[${c.id}] ${c.author} — ${c.createdAt}`);
    lines.push(c.text);
    lines.push("");
  }
  return lines.join("\n");
}

export const getOwnPostsSchema = z.object({
  count: z.number().min(1).max(50).default(10).describe("Number of posts to fetch"),
});

export async function getOwnPosts(
  client: LinkedInClient,
  args: z.infer<typeof getOwnPostsSchema>,
): Promise<string> {
  const posts = await client.getOwnPosts(args.count);
  if (posts.length === 0) return "No posts found.";

  const lines: string[] = [];
  for (const p of posts) {
    lines.push(`[${p.id}] ${p.createdAt}`);
    lines.push(p.text.slice(0, 200) + (p.text.length > 200 ? "..." : ""));
    lines.push("");
  }
  return lines.join("\n");
}

export const getPostStatsSchema = z.object({
  post_urn: z.string().describe("URN of the post"),
});

export async function getPostStats(
  client: LinkedInClient,
  args: z.infer<typeof getPostStatsSchema>,
): Promise<string> {
  const stats = await client.getPostStats(args.post_urn);
  return `Likes: ${stats.likes}\nComments: ${stats.comments}`;
}
