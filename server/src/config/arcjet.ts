import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import { isSpoofedBot } from "@arcjet/inspect";
import env from "./env.js";

const aj = arcjet({
  
  key: env.ARCJET_KEY,
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        "CATEGORY:MONITOR", // Uptime monitoring services
        "CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    slidingWindow({
      mode: "LIVE",
      interval: 2, // Refill every 2 seconds
      max: 5, // Bucket capacity of 5 token
    }),
  ],
});

export default aj;