// module.exports = {
//   presets: ['@babel/preset-env', '@babel/preset-react'],
//   plugins: [
//     '@babel/plugin-syntax-jsx',
//     '@babel/plugin-syntax-dynamic-import',
//     'react-refresh/babel',
//   ],
// };

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
    // 'react-refresh/babel',
  ];

  if (isEnvDevelopment) {
    plugins.push('react-refresh/babel');
  }

  return {
    presets,
    plugins,
  };
};
