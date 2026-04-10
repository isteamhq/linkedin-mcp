import { z } from "zod";
import type { LinkedInClient } from "../client.js";

export const createPostSchema = z.object({
  text: z.string().max(3000).describe("Post text (max 3000 chars)"),
});

export async function createPost(
  client: LinkedInClient,
  args: z.infer<typeof createPostSchema>,
): Promise<string> {
  const urn = await client.createPost(args.text);
  return `Post created!\nURN: ${urn}`;
}

export const createArticlePostSchema = z.object({
  text: z.string().max(3000).describe("Commentary text for the article share"),
  article_url: z.string().describe("URL of the article to share"),
  article_title: z.string().optional().describe("Title for the article card"),
  article_description: z.string().optional().describe("Description for the article card"),
});

export async function createArticlePost(
  client: LinkedInClient,
  args: z.infer<typeof createArticlePostSchema>,
): Promise<string> {
  const urn = await client.createArticlePost(
    args.text,
    args.article_url,
    args.article_title,
    args.article_description,
  );
  return `Article post created!\nURN: ${urn}`;
}

export const deletePostSchema = z.object({
  post_urn: z.string().describe("URN of the post to delete (e.g. urn:li:share:123456)"),
});

export async function deletePost(
  client: LinkedInClient,
  args: z.infer<typeof deletePostSchema>,
): Promise<string> {
  await client.deletePost(args.post_urn);
  return `Post deleted: ${args.post_urn}`;
}

export const commentOnPostSchema = z.object({
  post_urn: z.string().describe("URN of the post to comment on"),
  text: z.string().max(1250).describe("Comment text (max 1250 chars)"),
});

export async function commentOnPost(
  client: LinkedInClient,
  args: z.infer<typeof commentOnPostSchema>,
): Promise<string> {
  const id = await client.commentOnPost(args.post_urn, args.text);
  return `Comment posted!\nID: ${id}\nOn: ${args.post_urn}`;
}

export const likePostSchema = z.object({
  post_urn: z.string().describe("URN of the post to like"),
});

export async function likePost(
  client: LinkedInClient,
  args: z.infer<typeof likePostSchema>,
): Promise<string> {
  await client.likePost(args.post_urn);
  return `Post liked: ${args.post_urn}`;
}
