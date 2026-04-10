# @isteam/linkedin-mcp

[![npm version](https://img.shields.io/npm/v/@isteam/linkedin-mcp.svg)](https://www.npmjs.com/package/@isteam/linkedin-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

MCP server for LinkedIn — post, comment, react, and manage content via AI agents.

Built by [is.team](https://is.team) — the AI-native project management platform.

## Quick Start

Add to your MCP config (`.mcp.json` for Claude Code, or Claude Desktop settings):

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "npx",
      "args": ["-y", "@isteam/linkedin-mcp"],
      "env": {
        "LINKEDIN_ACCESS_TOKEN": "your-access-token",
        "LINKEDIN_PERSON_ID": "your-person-id"
      }
    }
  }
}
```

## Tools (10)

### Content & Engagement

| Tool | Description |
|------|-------------|
| `create_post` | Create a LinkedIn text post (max 3000 characters) |
| `create_article_post` | Share an article link with commentary |
| `delete_post` | Delete a post by URN |
| `comment_on_post` | Comment on a post (max 1250 characters) |
| `like_post` | Like/react to a post |

### Profile & Analytics

| Tool | Description |
|------|-------------|
| `get_me` | Get authenticated user info |
| `get_post` | Get a post by URN (text, author, stats) |
| `get_comments` | Get comments on a post |
| `get_own_posts` | Get your recent LinkedIn posts |
| `get_post_stats` | Get like/comment counts for a post |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LINKEDIN_ACCESS_TOKEN` | Yes | OAuth 2.0 access token |
| `LINKEDIN_PERSON_ID` | Yes* | Your LinkedIn person ID (required in member mode) |
| `LINKEDIN_ORGANIZATION_ID` | No | Organization ID (for posting as a company page) |
| `LINKEDIN_MODE` | No | `member` (default) or `organization` |

*Required when `LINKEDIN_MODE` is `member` (default).

### Getting your credentials

1. Create an app in the [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Request the `w_member_social` and `r_liteprofile` OAuth scopes
3. Complete the OAuth 2.0 flow to get an access token
4. Get your person ID from the `/v2/userinfo` endpoint

### Organization mode

To post as a company page, set `LINKEDIN_MODE=organization` and provide `LINKEDIN_ORGANIZATION_ID`:

```json
{
  "env": {
    "LINKEDIN_ACCESS_TOKEN": "your-access-token",
    "LINKEDIN_PERSON_ID": "your-person-id",
    "LINKEDIN_ORGANIZATION_ID": "your-org-id",
    "LINKEDIN_MODE": "organization"
  }
}
```

## Usage Examples

**Share a thought leadership post:**
> "Post on LinkedIn: AI agents are changing how teams collaborate. At is.team, we're building a future where AI joins your standups and ships features alongside you."

**Share an article:**
> "Share this article on LinkedIn with a summary: https://example.com/article-about-ai"

**Engage with your network:**
> "Get my recent LinkedIn posts and show their engagement stats"

## About is.team

[is.team](https://is.team) is an AI-native project management platform where AI agents and humans collaborate as real teammates. AI agents join boards, create tasks, chat, and get work done — just like any other team member.

Part of the [is.team](https://is.team) open-source MCP ecosystem:
- [@isteam/mcp](https://www.npmjs.com/package/@isteam/mcp) — Project management
- [@isteam/google-ads-mcp](https://www.npmjs.com/package/@isteam/google-ads-mcp) — Google Ads
- [@isteam/twitter-mcp](https://www.npmjs.com/package/@isteam/twitter-mcp) — Twitter/X
- [@isteam/bluesky-mcp](https://www.npmjs.com/package/@isteam/bluesky-mcp) — Bluesky
- [@isteam/linkedin-mcp](https://www.npmjs.com/package/@isteam/linkedin-mcp) — LinkedIn

## License

MIT
