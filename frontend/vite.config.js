import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import envCompatible from 'vite-plugin-env-compatible';

// REACT_APP_* values are inlined into the bundle at build time — they are NOT
// read at runtime, so setting them on the Cloud Run service does nothing. When
// a build arg is missing, `vite-plugin-env-compatible` defines the var as ''
// and every `process.env.X || 'fallback'` in the source quietly collapses to
// its fallback. That shipped a placeholder Google OAuth client ID to
// production once; fail the build instead of shipping a broken login page.
// Opt-in via STRICT_BUILD_ENV so only the real deploy path is gated. CI builds
// the app and the image without these values purely to validate compilation,
// and local builds shouldn't need production credentials — neither should fail.
// cloudbuild.yaml is the only caller that sets the flag.
const requiredForProduction = ['REACT_APP_GOOGLE_CLIENT_ID'];

const assertProductionEnv = () => ({
  name: 'assert-production-env',
  apply: 'build',
  config(_config, { mode }) {
    if (mode !== 'production' || process.env.STRICT_BUILD_ENV !== '1') return;
    const missing = requiredForProduction.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `Missing required build-time env var(s): ${missing.join(', ')}.\n` +
          'These are inlined into the bundle at build time. Pass them as Docker ' +
          '--build-arg (see cloudbuild.yaml) or export them before `npm run build`.'
      );
    }
  },
});

export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgr(),
    envCompatible({ prefix: 'REACT_APP', mountedPath: 'process.env' }),
    assertProductionEnv(),
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
  },
});
