import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import image from '@rollup/plugin-image';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/enrty.js',
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    image(),
    postcss({
      extensions: ['.css'],
    }),
    nodeResolve({
      extensions: ['.js'],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
      preventAssignment: true,
    }),
    babel({
      presets: ['@babel/preset-env', '@babel/preset-react'],
      plugins: ['@babel/plugin-syntax-jsx'],
      exclude: 'node_modules/**',
      babelHelpers: 'bundled'
    }),
    commonjs(),
    serve({
      open: true,
      verbose: true,
      contentBase: ['', 'public'],
      host: 'localhost',
      port: 3000,
    }),
    livereload({ watch: 'dist' }),
  ]
};
