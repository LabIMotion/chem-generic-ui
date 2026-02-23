import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// All packages that must NOT be bundled (consumed by the host app)
const EXTERNALS = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'lodash',
  'reactflow',
  'ag-grid-community',
  'ag-grid-react',
  'copy-to-clipboard',
  'react-select',
  'react-bootstrap',
  'react-dnd',
  'react-datepicker',
  'react-dropzone',
  'react-draggable',
  'humps',
  'moment',
  'numeral',
  'prop-types',
  '@fortawesome/fontawesome-svg-core',
  '@fortawesome/free-regular-svg-icons',
  '@fortawesome/free-solid-svg-icons',
  '@fortawesome/react-fontawesome',
  'uuid',
  'ajv',
  'diff',
  'generic-ui-core',
  'html-to-image',
  'jsondiffpatch',
  'mathjs',
  'moment-precise-range-plugin',
  'react-dnd-html5-backend',
  'react-svg-file-zoom-pan',
];

const ALIASES = {
  '@': resolve(__dirname, 'src'),
  '@components': resolve(__dirname, 'src/components'),
  '@assets': resolve(__dirname, 'src/assets'),
  '@schemas': resolve(__dirname, 'src/schemas'),
  '@utils': resolve(__dirname, 'src/utils'),
  '@models': resolve(__dirname, 'src/models'),
  '@ui': resolve(__dirname, 'src/ui'),
  '@root': resolve(__dirname),
};

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
  ],

  // Treat .js files as JSX — all source files use .js extension but contain JSX
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: [],
  },

  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },

  resolve: {
    alias: ALIASES,
    extensions: ['.js', '.jsx'],
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },

  publicDir: false,

  // ─── Library build ────────────────────────────────────────────────────────
  build: {
    minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,
    lib: {
      entry: resolve(__dirname, 'src/entry.js'),
      name: 'ChemGenericUI',
      fileName: (format) => `chem-generic-ui.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: EXTERNALS.map((pkg) => new RegExp(`^${pkg}(\\/.*)?$`)),
      output: {
        assetFileNames: 'chem-generic-ui.[ext]',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          lodash: '_',
        },
      },
    },
    sourcemap: process.env.NODE_ENV === 'production' ? true : 'inline',
    emptyOutDir: true,
  },

  css: {
    postcss: './postcss.config.js',
  },

  // ─── Vitest ───────────────────────────────────────────────────────────────
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup-vitest.js'],

    // Inline ESM-only packages so Vitest can transform them
    server: {
      deps: {
        inline: ['generic-ui-core', 'chem-units'],
      },
    },

    // Disable CSS processing in tests (no-op for all CSS/SCSS imports)
    css: false,

    // Match the same test files Jest was using
    include: ['src/__test__/**/*.test.js'],

    hookTimeout: 30000,
    testTimeout: 30000,

    resolve: {
      alias: ALIASES,
    },
  },
});
