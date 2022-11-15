const ppresent = require('postcss-preset-env');

module.exports = {
  plugins: [
    ppresent({
      browsers: 'last 2 versions',
    }),
  ],
};
