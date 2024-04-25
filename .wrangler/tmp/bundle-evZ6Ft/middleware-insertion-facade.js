				import worker, * as OTHER_EXPORTS from "E:\\WEB DEV\\verbavo\\model-api\\index";
				import * as __MIDDLEWARE_0__ from "E:\\WEB DEV\\Verbavo\\model-api\\node_modules\\.pnpm\\wrangler@3.51.2\\node_modules\\wrangler\\templates\\middleware\\middleware-ensure-req-body-drained.ts";
import * as __MIDDLEWARE_1__ from "E:\\WEB DEV\\Verbavo\\model-api\\node_modules\\.pnpm\\wrangler@3.51.2\\node_modules\\wrangler\\templates\\middleware\\middleware-miniflare3-json-error.ts";
				
				worker.middleware = [
					__MIDDLEWARE_0__.default,__MIDDLEWARE_1__.default,
					...(worker.middleware ?? []),
				].filter(Boolean);
				
				export * from "E:\\WEB DEV\\verbavo\\model-api\\index";
				export default worker;