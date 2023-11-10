import { merge } from 'webpack-merge';
import base from './base';
import path from 'node:path';

export default merge(base, {
    mode: 'development',
    cache: {
        type: 'filesystem',
        name: 'dev'
    },
    output: {
        path: path.resolve(".", "userscripts"),
        filename: "[name].js"
    },
    devtool: 'eval-source-map',
    watch: true,
    watchOptions: {
        ignored: /node_modules/
    }
});