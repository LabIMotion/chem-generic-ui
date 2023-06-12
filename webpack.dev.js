const path = require('path');
// const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/dist/',
    filename: 'bundle.js',
    clean: true,
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      util: false,
      fs: false,
      'react/jsx-runtime': 'react/jsx-runtime.js',
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
    },
  },
  plugins: [new ReactRefreshWebpackPlugin()],
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
        // exclude: /(node_modules|bower_components)(?!\/@reactflow)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [require.resolve('react-refresh/babel')],
          },
        },
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
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public/'),
    },
    port: 8080,
    devMiddleware: {
      publicPath: 'http://localhost:3000/dist/',
    },
    open: true,
    hot: true,
  },
  // plugins: [new HtmlWebpackPlugin({ template: './piblic/index.html' })],
  // plugins: [new webpack.HotModuleReplacementPlugin()] // no need, https://stackoverflow.com/questions/69102254/webpack-options-has-an-unknown-property-hotonly-invalid-options-object-dev-s
};
