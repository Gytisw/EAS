# Vite Configuration & Setup Summary

*   **Configuration File:**
    *   Typically `vite.config.js` or `vite.config.ts`.
    *   Use `defineConfig` helper for IntelliSense and type checking.
    *   Can use JSDoc (`/** @type {import('vite').UserConfig} */`) in JS files or `satisfies UserConfig` in TS files for type safety.
*   **Key Configuration Sections:**
    *   `plugins`: Add Vite plugins (e.g., `@vitejs/plugin-react` for React support).
    *   `server`: Configure the development server (port, auto-open browser, proxy, filesystem access (`fs.allow`), middleware mode).
    *   `build`: Configure production build options (output directory, Rollup options).
    *   `preview`: Configure the preview server (port).
    *   `resolve`: Configure module resolution (aliases, conditions).
    *   `define`: Define global constants accessible in client code (requires type declaration in `vite-env.d.ts` for TypeScript).
    *   `esbuild`: Configure ESBuild options (e.g., `jsxInject` to auto-import React).
    *   `environments`: Configure different execution environments (client, server/SSR).
*   **Development Server:**
    *   **Running:** Use `npm run dev` or `yarn dev` (defined in `package.json` to run `vite`) or `vite dev` directly.
    *   **Programmatic API:** Use `createServer` from the `vite` package to embed Vite's dev server, often in `middlewareMode: true` for integration with frameworks like Express.
    *   **Features:** Fast Hot Module Replacement (HMR), on-demand file serving.
    *   **Custom Middleware:** Use the `configureServer` plugin hook to add custom middleware.
*   **React Integration:**
    *   Use the official `@vitejs/plugin-react` plugin.
    *   Handles JSX transformation and integrates React Fast Refresh for HMR.
    *   ESLint integration for React rules is possible (e.g., `eslint-plugin-react-x`).
*   **TypeScript Integration:**
    *   Vite supports `.ts` files out-of-the-box for code and configuration (`vite.config.ts`).
    *   **Type Checking:** Vite performs *transpilation* only during development. Type checking should be done separately via `tsc --noEmit` or IDE integration.
    *   **Environment Variables:** Define types for environment variables (`import.meta.env.VITE_...`) in `vite-env.d.ts` by augmenting the `ImportMetaEnv` interface.
    *   **Global Constants:** Declare types for constants defined in `define` within `vite-env.d.ts`.
    *   **ESLint:** Type-aware ESLint rules can be configured by specifying `tsconfig.json` paths in `eslint.config.js`.
*   **Preview Server:**
    *   **Running:** Use `npm run preview` or `vite preview` to serve the production build locally.
    *   **Configuration:** Set port and other options in the `preview` section of the config or via CLI flags (`--port`).