module.exports = function (api) {
  api.cache(true);

  const presets = [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: '> 0.25%, not dead',
        useBuiltIns: false,
        corejs: 3,
      },
    ],
    '@babel/preset-react',
  ];
  const plugins = [
    '@babel/plugin-syntax-jsx',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-react-jsx',
    '@babel/plugin-transform-class-properties',
    '@babel/plugin-transform-modules-commonjs',
  ];

  return {
    presets,
    plugins,
  };
};
