var webpack = require("webpack"),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: "./js/main.js",
    output: {
        filename: "app.js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                options: {
                    presets: ["es2015"]
                }
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract(["css-loader", "sass-loader"])
            }
        ]
    },
    plugins: [
        // Avoid publishing files when compilation fails
        new webpack.NoEmitOnErrorsPlugin(),
        // Minify output
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true
        }),
        ///Define options for the sass-loader
        new webpack.LoaderOptionsPlugin({
            options: {
                sassLoader: {
                    outputStyle: "compressed"
                }
            }
        }),
        //Extract css
        new ExtractTextPlugin({
            filename: 'style.css',
            allChunks: true
        })
    ],
    stats: {
        // Nice colored output
        colors: true
    },
    // Create Sourcemaps for the bundle
    devtool: "source-map"
};
