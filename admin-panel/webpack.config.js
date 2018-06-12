const path = require("path"),
      webpack = require("webpack"),
      CleanWebpackPlugin = require("clean-webpack-plugin"),
      MiniCssExtractPlugin = require("mini-css-extract-plugin"),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      UglifyJsPlugin = require("uglifyjs-webpack-plugin"),
      OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const buildPath = path.resolve(__dirname, "build");
const assetsFolder = "assets/";

const config = {
    entry: "./src/index.js",
    output: {
        filename: path.join(assetsFolder, "[chunkhash].js"),
        path: buildPath,
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
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.(ttf|eot|woff|woff2|svg|jpg|gif|png)$/,
                loader: "file-loader",
                options: {
                    //Set publicPath to an empty string so file-loader doesn't prepend the global public path.
                    //(The assets already get saved in the assets folder, which results in "assets/assets" as path)
                    publicPath: "./",
                    outputPath: "assets/"
                }
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
        //Extract css
        new MiniCssExtractPlugin({
            filename: path.join(assetsFolder, "[contenthash].css")
        }),
        //Create html entry file
        new HtmlWebpackPlugin({
            template: "src/templates/index.html"
        })

    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true
            }),
            new OptimizeCSSAssetsPlugin()
        ]
    },
    devtool: "source-map"
};

module.exports = (env, argv) => {
    if (argv.mode === "production") {
        config.plugins.push(
            //Remove old build
            new CleanWebpackPlugin(buildPath, {
                beforeEmit: true //Deletes the build folder just before the new files are saved
            })
        );
    }

    return config
};
