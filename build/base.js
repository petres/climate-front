const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin  = require('mini-css-extract-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const path = require('path')

const resolve = (dir) => path.join(__dirname, '..', dir)

module.exports = {
    entry: [
        './src/app.js',
    ],
    output: {
        filename: 'app.min.[fullhash].js'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader',
            }, {
                test: /\.js$/,
                use: 'babel-loader'
            }, {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ]
            }, {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader",
                ],
            }, {
                test: /\.svg$/,
                use: [
                    'vue-loader',
                    'vue-svg-loader',
                ],
            },
        ]
    },
    resolve: {
        alias: {
            '@': resolve('src'),
        },
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true,
            publicPath: '/',
        }),
        new MiniCssExtractPlugin({
            filename: 'main.[fullhash].css',
        }),
        new FaviconsWebpackPlugin('assets/icons/climate.png'),
    ],
}
