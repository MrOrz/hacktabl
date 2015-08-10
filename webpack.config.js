var DEVSERVER_PORT = 5000,
    path = require('path'),
    serveStatic = require('serve-static'),
    router = require('express').Router(),
    webpack = require('webpack'),
    ExtractText = require('extract-text-webpack-plugin');

var isProduction = process.env.NODE_ENV === 'production';

// Base config
//
var webpackCfg = {
  entry: {
    'app': './src/livescript/app.ls',
  },
  output: {
    // __dirname is the path of webpack.js
    path: path.join(__dirname, 'build'),
    filename: ( isProduction ? '[hash].js' : 'app.js')
  },
  module: {
    loaders: [
      {
        test: /\.ls$/,
        loader: 'livescript'
      },
      {
        test: /\.s[a|c]ss$/,
        loader: ExtractText.extract(
          "css!sass?sourceMap&indentedSyntax&includePaths[]=" +
            path.resolve(__dirname, "./node_modules/compass-mixins/lib")
        )
      },
      {
        test: /\.(?:jpg|png|gif|eot|svg|ttf|woff|woff2|otf)$/,
        loader: "url-loader?limit=10000"
      }
    ],
    noParse: /vendor\/bower_components/
  },
  plugins: [
    new ExtractText( isProduction ? "[hash].css" : "app.css" ),
    new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
  ],
  debug: !isProduction,
  externals: {
    // require("jquery") is external and available
    //  on the global var jQuery
    "jquery": "jQuery"
  },
  resolve: {
    root: [path.join(__dirname, 'vendor', 'bower_components')],
    extensions: ['', '.js', '.ls']
  }
};

// Other env-based configs
//
if( isProduction ){
  webpackCfg.plugins.push(new webpack.optimize.UglifyJsPlugin({
    sourceMap: false
  }));

  webpackCfg.plugins.push(new webpack.DefinePlugin({
    GOOGLE_API_KEY: 'AIzaSyAA0OqwnzmbCumAAdx0F0cKACCs-s5ncQY' // allows http://hacktabl.org/*
  }));
} else {
  webpackCfg.devtool = '#source-map';

  // Hot module replacement setup
  // Ref:
  // http://webpack.github.io/docs/webpack-dev-server.html#combining-with-an-existing-server
  // http://gaearon.github.io/react-hot-loader/#enabling-hot-module-replacement
  //
  webpackCfg.entry.app = [
    'webpack-dev-server/client?localhost:' + DEVSERVER_PORT,
    'webpack/hot/dev-server',
    webpackCfg.entry.app
  ];

  // Serve static files outside /build as well
  router.use(serveStatic(__dirname));

  // If file not found and the path does not start with /build (such as /fepz),
  // send out index.html
  router.get(/^(?!\/build|\/$)/, function(req, res){
    res.sendFile(__dirname+'index.html');
  });

  webpackCfg.devServer = {
    host: '0.0.0.0',
    port: DEVSERVER_PORT,
    hot: true,
    historyApiFallback: router
  };

  webpackCfg.plugins.push(new webpack.HotModuleReplacementPlugin());
  webpackCfg.plugins.push(new webpack.DefinePlugin({
    GOOGLE_API_KEY: JSON.stringify('AIzaSyBgewvC_6aFKXJnnzX0y2tp0xPM2ZLdk_w') // allows http://localhost:5000/*
  }));
  webpackCfg.output.publicPath = '/build/'
}

module.exports = webpackCfg;
