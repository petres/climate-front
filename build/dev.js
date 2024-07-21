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
            directory: path.join(__dirname, "../assets/data/"),
            publicPath: '/data',
            watch: false,
        },
        proxy: [{
            context: ['/api'],
            target: {
                host: "127.0.0.1",
                protocol: 'http:',
                port: 8888
            },
            // target: "https://ecad.abteil.org",
            // changeOrigin: true,
        }]
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
