import "dotenv/config";
import express from "express";
import path from "node:path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { registerMapsScriptProxy } from "../server/mapsScriptProxy";
import { registerCivicAttachmentRoutes } from "../server/civicAttachments";
import { registerFirebaseSessionRoutes } from "../server/firebaseSession";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerStorageProxy(app);
registerCivicAttachmentRoutes(app);
registerMapsScriptProxy(app);
registerOAuthRoutes(app);
registerFirebaseSessionRoutes(app);
app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

const clientDist = path.join(process.cwd(), "dist", "public");
app.use(express.static(clientDist));
app.use("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));

export default app;
