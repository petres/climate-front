const baseConfig = require('./base.js');
const { merge } = require('webpack-merge');

module.exports = merge(baseConfig, {
    mode: 'development',
    devServer: {
        // open: true,
        historyApiFallback: {
            disableDotRule: true
        },
        // liveReload: true,
        // hot: false,
    },
    devtool: 'source-map'
});
