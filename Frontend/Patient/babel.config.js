module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ts', '.tsx', '.js', '.json'],
          alias: {
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@theme': './src/theme',
            '@context': './src/context',
            '@mock': './src/mock',
            '@types': './src/types'
          }
        }
      ]
    ]
  };
};
