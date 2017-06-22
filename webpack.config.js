const path = require('path');

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'public', 'dist'),
        filename: 'bundle.js'
    },

    devtool: "source-map",

    module: {
        loaders: [{
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2017'],
                    plugins: ['transform-class-properties', 'transform-object-rest-spread']
                }
            },
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader'
            },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, "public"),
        publicPath: "/dist/",
        compress: true,
        port: 9000
    },
    resolve: { extensions: ['.js', '.ts'] }

};
