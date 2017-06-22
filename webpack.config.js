const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'public', 'dist'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
                presets: ['es2017'],
                plugins: ['transform-class-properties', 'transform-object-rest-spread']
            }
        }]
    },
    devServer: {
        contentBase: path.join(__dirname, "public"),
        publicPath: "/dist/",
        compress: true,
        port: 9000
    }

};
