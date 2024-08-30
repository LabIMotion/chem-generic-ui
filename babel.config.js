const isEnvDevelopment = process.env.NODE_ENV === 'development';

module.exports = function (api) {
  api.cache(true);

  const presets = [
    ['@babel/preset-env', { modules: false }],
    '@babel/preset-react',
  ];
  const plugins = [
    '@babel/plugin-syntax-jsx',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-react-jsx',
    '@babel/plugin-transform-class-properties',
  ];

  plugins.push('@babel/plugin-transform-modules-commonjs');
  if (isEnvDevelopment) {
    plugins.push('react-refresh/babel');
  }

  return {
    presets,
    plugins,
  };
};
