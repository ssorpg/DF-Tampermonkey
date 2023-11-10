import TerserPlugin from "terser-webpack-plugin";
import { Configuration, BannerPlugin } from "webpack";
import { generateHeader } from "../plugins/userscript.plugin";

const config: Configuration = {
    // Add an entry here to compile it as a js file
    entry: {
        "Auto-Scroll": "./src/Auto-Scroll.ts",
        "Faster Page Change": "./src/Faster Page Change.ts",
        "Interface Fixes": "./src/Interface Fixes.ts",
        "Service Context Menu": "./src/Service Context Menu.ts"
    },
    target: "web",
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.m?ts$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    optimization: {
        minimize: false,
        minimizer: [new TerserPlugin({
            // minify: TerserPlugin.swcMinify,
            terserOptions: {
                format: {
                    comments: false
                },
                compress: false,
                mangle: false
            },
            extractComments: false
        })]
    },
    plugins: [
        new BannerPlugin({
            banner: generateHeader,
            raw: true
        })
    ]
};

export default config;