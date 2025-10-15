import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";

export async function setupVite(app: Express, server: any) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "spa",
  });

  app.use(vite.middlewares);

  app.use((req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;

    if (url.startsWith('/api')) {
      return next();
    }

    (async () => {
      try {
        const clientPath = path.resolve(process.cwd(), "client");
        const template = await fs.promises.readFile(
          path.resolve(clientPath, "index.html"),
          "utf-8"
        );
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    })();
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  app.use((_req: Request, res: Response) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
