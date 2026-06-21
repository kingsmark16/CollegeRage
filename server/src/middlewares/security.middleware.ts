import { slidingWindow } from "@arcjet/node";
import aj from "../config/arcjet.js";
import { Request, Response, NextFunction } from "express";
import logger from "../config/logger.js";

const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const client = aj.withRule(slidingWindow({
            mode: "LIVE",
            interval: 10, // Refill every 2 seconds
            max: 20,
        }));

        const decision = await client.protect(req);

        if(decision.isDenied() && decision.reason.isBot()){
            logger.warn(`Blocked bot request: ${req.method} ${req.url} ${req.ip} ${req.get("User-Agent")}`);
            return res.status(403).send({ error: "Forbidden", message: "Your request has been blocked by our security system." });
        }
         if(decision.isDenied() && decision.reason.isShield()){
            logger.warn(`Blocked shield request: ${req.method} ${req.url} ${req.ip} ${req.get("User-Agent")}`);
            return res.status(403).send({ error: "Forbidden", message: "Your request has been blocked by our security system." });
        }
         if(decision.isDenied() && decision.reason.isRateLimit()){
            logger.warn(`Blocked rate limit request: ${req.method} ${req.url} ${req.ip} ${req.get("User-Agent")}`);
            return res.status(429).send({ error: "Too Many Requests", message: "Too many requests. Please try again later." });
        }
        
        next();
    }catch (error) {
        console.error("Error in security middleware:", error);
        if (!res.headersSent) {
            res.status(500).send({ error: "Internal Server Error", message: "Something went wrong in the security middleware." });
        }
    }
}

export default securityMiddleware;
