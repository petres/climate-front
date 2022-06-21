const baseConfig = require('./base.js');
const { merge } = require('webpack-merge');

module.exports = merge(baseConfig, {
    mode: 'production',
})
