var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    './src/index'
  ],
  output: {
    path: __dirname,
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: [],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['react-hot', 'babel'],
      include: path.join(__dirname, 'src')
    },{
      test: /\.scss$/,
      loaders: ['style', 'css', 'autoprefixer',  'sass']
    },{
      test: /\.(jpe?g|png|gif|svg)$/i,
      loaders: [
        'file?name=[path][name].[ext]'
      ]
    },{
      test: /\.(m4a|mp3|ogg)$/i,
      loaders: [
        'file?name=[path][name].[ext]'
      ]
    }]
  },
  sassLoader: {
    includePaths: [path.resolve(__dirname, "./style")]
  }
};
