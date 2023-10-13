import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import path from  "path";

rules.push({
  test: /\.css$/,
  include: [path.resolve(__dirname, "src")],
  use: [
    "style-loader",
    "css-loader",
    "postcss-loader"
  ]
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
