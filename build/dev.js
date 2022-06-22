const baseConfig = require('./base.js');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path')


module.exports = merge(baseConfig, {
    mode: 'development',
    devServer: {
        open: true,
        historyApiFallback: {
            disableDotRule: true
        },
        liveReload: true,
        hot: false,
        static: {
            directory: path.join(__dirname, "../../data/server/data-new"),
            publicPath: '/data',
            watch: false,
        },
    },
    devtool: 'source-map',
    plugins: [
        // new CopyWebpackPlugin({
        //     patterns: [
        //       { from: '../data/server/data', to: 'data' },
        //     ],
        // }),
    ],
});
