'use strict'

const webpack = require('webpack')

const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin  = require('mini-css-extract-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

const path = require('path')
const resolve = function(dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = (env) => {
    const publicPath = '/';
    return {
        mode: 'development',
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
                        // Creates `style` nodes from JS strings
                        MiniCssExtractPlugin.loader,
                        // Translates CSS into CommonJS
                        "css-loader",
                        {
                            // Run postcss actions
                            loader: 'postcss-loader',
                            options: {
                                // `postcssOptions` is needed for postcss 8.x;
                                // if you use postcss 7.x skip the key
                                postcssOptions: {
                                    // postcss plugins, can be exported to postcss.config.js
                                    plugins: function () {
                                        return [
                                            require('autoprefixer')
                                        ];
                                    }
                                }
                            }
                        },
                        // Compiles Sass to CSS
                        "sass-loader",
                    ],
                }, {
                    test: /\.svg$/,
                    use: [
                        'vue-loader',
                        'vue-svg-loader',
                    ],
                },
                // {
                //     test: /\.(js|vue)$/,
                //     use: 'eslint-loader',
                //     enforce: 'pre'
                // },
            ]
        },
        devServer: {
            open: true,
            // watchOptions: {
            //     poll: true,
            // },
            historyApiFallback: {
              disableDotRule: true
            },
            open: true,
            liveReload: true,
            hot: false
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
                publicPath: publicPath
            }),
            new CopyWebpackPlugin({
                patterns: [
                  { from: "assets/data", to: "data" },
                  { from: "assets/.htaccess", to: "" },
                  // { from: "assets/docs", to: "docs" },
                  // { from: "assets/img/logo.jpg", to: "img/logo.jpg" },
                ],
            }),
            new MiniCssExtractPlugin({
                filename: 'main.[hash].css'
            }),
            new FaviconsWebpackPlugin('assets/icons/climate.png'),
            // new webpack.DefinePlugin({
            //   'PUBLIC_PATH': JSON.stringify(publicPath),
            // })
        ],
    }
}
