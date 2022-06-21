const baseConfig = require('./base.js');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(baseConfig, {
    mode: 'development',
    devServer: {
        open: true,
        historyApiFallback: {
            disableDotRule: true
        },
        liveReload: true,
        hot: false,
    },
    devtool: 'source-map',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
              { from: "assets/data", to: "data" },
            ],
        }),
    ],
});
