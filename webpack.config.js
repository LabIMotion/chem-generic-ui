const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/entry.js',
  output: {
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/dist/',
    filename: 'bundle.js',
    clean: true,
    libraryTarget: 'umd',
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
    splitChunks: {
      chunks: 'async',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          filename: '[name].bundle.js',
          maxSize: 30000,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          filename: 'bundle.js',
          reuseExistingChunk: true,
        },
      },
    },
  },
  resolve: { extensions: ['.js', '.jsx'] },
  externals: {
    // Don't bundle react or react-dom
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'React',
      root: 'React'
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'ReactDOM',
      root: 'ReactDOM'
    },
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_', // indicates global variable
    },
    'react-flow-renderer': {
      commonjs: 'react-flow-renderer',
      commonjs2: 'react-flow-renderer',
      amd: 'react-flow-renderer',
      root: 'react-flow-renderer', // indicates global variable
    },
    'react-select': {
      commonjs: 'react-select',
      commonjs2: 'react-select',
      amd: 'Select',
      root: 'Select', // indicates global variable
    },
    'react-bootstrap': {
      commonjs: 'react-bootstrap',
      commonjs2: 'react-bootstrap',
      amd: 'react-bootstrap',
      root: 'react-bootstrap', // indicates global variable
    },
    'react-dnd': {
      commonjs: 'react-dnd',
      commonjs2: 'react-dnd',
      amd: 'react-dnd',
      root: 'react-dnd',
    },
    'react-dropzone': {
      commonjs: 'react-dropzone',
      commonjs2: 'react-dropzone',
      amd: 'Dropzone',
      root: 'Dropzone',
    },
    'react-draggable': {
      commonjs: 'react-draggable',
      commonjs2: 'react-draggable',
      amd: 'Draggable',
      root: 'Draggable',
    },
    '@fortawesome/fontawesome-svg-core': {
      commonjs: '@fortawesome/fontawesome-svg-core',
      commonjs2: '@fortawesome/fontawesome-svg-core',
      amd: '@fortawesome/fontawesome-svg-core',
      root: '@fortawesome/fontawesome-svg-core',
    },
    '@fortawesome/free-regular-svg-icons': {
      commonjs: '@fortawesome/free-regular-svg-icons',
      commonjs2: '@fortawesome/free-regular-svg-icons',
      amd: '@fortawesome/free-regular-svg-icons',
      root: '@fortawesome/free-regular-svg-icons',
    },
    '@fortawesome/free-solid-svg-icons': {
      commonjs: '@fortawesome/free-solid-svg-icons',
      commonjs2: '@fortawesome/free-solid-svg-icons',
      amd: '@fortawesome/free-solid-svg-icons',
      root: '@fortawesome/free-solid-svg-icons',
    },
    '@fortawesome/react-fontawesome': {
      commonjs: '@fortawesome/react-fontawesome',
      commonjs2: '@fortawesome/react-fontawesome',
      amd: '@fortawesome/react-fontawesome',
      root: '@fortawesome/react-fontawesome',
    },
  },
  module: {
    rules: [
      { test: /\.json$/, type: 'json' },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.(scss|css)$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          'postcss-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') })
  ],
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
  // plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })],
  // plugins: [new webpack.HotModuleReplacementPlugin()] // no need, https://stackoverflow.com/questions/69102254/webpack-options-has-an-unknown-property-hotonly-invalid-options-object-dev-s
};
