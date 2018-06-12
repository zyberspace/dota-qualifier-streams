const path = require("path"),
      webpack = require("webpack"),
      ExtractTextPlugin = require("extract-text-webpack-plugin"),
      HtmlWebpackPlugin = require('html-webpack-plugin');

const buildPath = path.resolve(__dirname, "build");
const production = process.env["NODE_ENV"] === "production";

const config = {
    entry: path.resolve(__dirname, "src", "index.js"),
    output: {
        filename: "app.js",
        path: buildPath
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("css-loader")
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract([
                    {
                        loader: "css-loader",
                        options: {
                            minimize: production,
                            sourceMap: true
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            outputStyle: "expanded",
                            sourceMap: true
                        }
                    }
                ])
            },
            {
                test: /\.yaml$/,
                loader: "yml-loader"
            }
        ]
    },
    node: {
        fs: "empty",
        tls: "empty"
    },
    plugins: [
        // Avoid publishing files when compilation fails
        new webpack.NoEmitOnErrorsPlugin(),
        //Module optimization for ECMAScript module syntax
        new webpack.optimize.ModuleConcatenationPlugin(),
        //Extract css
        new ExtractTextPlugin({
            filename: "style.css",
            allChunks: true
        }),
        //Create html entry file
        new HtmlWebpackPlugin({
            template: "src/templates/index.html"
        })
    ],
    stats: {
        // Nice colored output
        colors: true
    },
    // Create Sourcemaps for the bundle
    devtool: "source-map"
};

//Additional settings if this is a production build
if (production) {
    config.plugins.push(
        //let react know we compile for production
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        }),
        // Minify javascript
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true
        })
    );
}

module.exports = config;
