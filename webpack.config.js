var path = require('path');

module.exports =  {
    entry: path.join(__dirname, '/src/index.js'),
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'slate.js'
    },
    module: {
        loaders: [
            { test: /\.js$/,   loader: 'babel-loader' },
            { test: /\.jade$/, loader: 'jade-loader' }
        ]
    },
    resolve: {
        root: __dirname + '/src',
        fallback: [
            path.join(__dirname, '../core.js/src'),
            path.join(__dirname, '../fermat.js/src'),
            path.join(__dirname, '../boost.js/src')
        ],
        extensions: ['', '.js', '/component.js']
    },
    resolveLoader: {
        modulesDirectories: [path.join(__dirname, 'node_modules')]
    },
    devtool: 'sourcemap'  // 'eval', 'cheap-source-map'
};
