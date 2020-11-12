// eslint-disable-next-line @typescript-eslint/no-var-requires
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path')

const { DIR, EXT = 'ts' } = process.env;

module.exports = {
  mode: 'development',
  entry: `./${DIR}/index.${EXT}`,
  plugins: [
    new HtmlWebpackPlugin({
      template: `./${DIR}/public/index.html`,
    }),
  ],
  module: {
    rules: [{
      test: /\.jsx?/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react',
          ],
        },
      }],
    }, {
      test: /\.tsx?/,
      loader: 'ts-loader',
    }, {
      test: /\.css$/,
      use: [
        "style-loader",
        "css-loader"
      ],
      exclude: /node_modules/
    }, {
      test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
      use: [
        {
          loader: "url-loader",
          options: {
            limit: 10240, //10K
            esModule: false,
            name: "[name]_[hash:6].[ext]",
            outputPath: "assets"
          }
        }
      ],
      exclude: /node_modules/
    }],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      relinx: path.resolve(__dirname, 'src'),
    },
  },
  devServer: {
    port: process.env.PORT || '8081',
  },
  devtool: "cheap-module-eval-source-map"
};
