const path = require('path')
const images = require('remark-images')
const emoji = require('remark-emoji')

module.exports = {
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  webpackFinal: async (config) => {
    // config.module.rules.push({
    //   test: /\.(ts|tsx)$/,
    //   use: [
    //     {
    //       loader: require.resolve('ts-loader'),
    //       options: {
    //         transpileOnly: true,
    //       },
    //     },
    //     {
    //       loader: require.resolve('react-docgen-typescript-loader'),
    //     },
    //   ],
    // });

    // // https://storybook.js.org/docs/configurations/custom-webpack-config/
    // config.module.rules.splice(6, 1)

    // // https://github.com/webpack/webpack/issues/10843
    // config.module.rules.unshift({
    //   test: /\.css$/i,
    //   use: ['style-loader', 'css-loader'],
    //   // include: path.resolve(__dirname, '../src'),
    // });

    // config.resolve.extensions.push('.ts', '.tsx', '.css', 'js');
    config.resolve.alias = {
      relinx: path.resolve(__dirname, '..',  'src'),
    }

    return config;
  },
}