import { MyMCP } from "./mcp";
export { MyMCP } from "./mcp";
import type { Env } from "./types";
import { parseTools } from "./utils/parseTools";

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		// 1. Leer headers si existen
		const headerToken = request.headers.get("KOMMO_LONG_DURATION_TOKEN");
		const headerSubdomain = request.headers.get("KOMMO_ACCOUNT_SUBDOMAIN");
		const headerTools = request.headers.get("TOOLS_TO_USE");

		// 2. Elegir header > env
		const finalConfig = {
			KOMMO_LONG_DURATION_TOKEN:
				headerToken || env.KOMMO_LONG_DURATION_TOKEN,
			KOMMO_ACCOUNT_SUBDOMAIN:
				headerSubdomain || env.KOMMO_ACCOUNT_SUBDOMAIN,
			TOOLS_TO_USE: parseTools(headerTools, env.TOOLS_TO_USE)
		};

		// 3. Inyectar las variables en ctx.props
		const context = Object.assign(Object.create(ctx), ctx, {
			props: {
				...(ctx as any).props,
				...finalConfig
			},
		});

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, context);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, context);
		}

		return new Response("Not found", { status: 404 });
	},
};