const baseConfig = require('./base.js');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = merge(baseConfig, {
    mode: 'production',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: "assets/.htaccess", to: "" },
                { from: "assets/data", to: "data" },
            ],
        }),
    ],
})
