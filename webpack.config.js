var DEVSERVER_PORT = 5000,
    path = require('path'),
    fs = require('fs'),
    webpack = require('webpack'),
    ExtractText = require('extract-text-webpack-plugin'),
    packageJson = require('./package.json');

var isProduction = process.env.NODE_ENV === 'production';

// Base config
//
var webpackCfg = {
  entry: {
    'index': './src/index.js',
  },
  output: {
    // __dirname is the path of webpack.js
    path: path.join(__dirname, 'build'),
    filename: ( isProduction ? '[hash].js' : 'index.js')
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: packageJson.babel,
        exclude: /node_modules/
      },
      {
        test: /\.s[a|c]ss$/,
        include: [
          path.resolve(__dirname, './node_modules/material-design-lite/src')
        ],
        loader: ExtractText.extract('style-loader',
          "css?importLoaders=1!sass?sourceMap&includePaths[]=" +
            path.resolve(__dirname, './node_modules/material-design-lite/src')
        )
      },
      {
        test: /.s[a|c]ss$/,
        include: [
          path.resolve(__dirname, './src')
        ],
        loader: ExtractText.extract('style-loader',
          "css?modules&importLoaders=1!sass?sourceMap&indentedSyntax&includePaths[]=" +
            path.resolve(__dirname, "./node_modules/compass-mixins/lib")
        )
      },
      {
        test: /\.(?:jpg|png|gif|eot|svg|ttf|woff|woff2|otf)$/,
        loader: "url-loader?limit=10000"
      },
      {
        test: /hacktabl-parser/,
        loader: 'exports?hacktablParser.default'
      }
    ],
    noParse: /vendor\/bower_components/
  },
  plugins: [
    new ExtractText( isProduction ? "[hash].css" : "index.css", { allChunks: false }),
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
    GOOGLE_API_KEY: JSON.stringify('AIzaSyAA0OqwnzmbCumAAdx0F0cKACCs-s5ncQY') // allows http://hacktabl.org/*
  }));
} else {
  webpackCfg.devtool = '#source-map';

  // Hot module replacement setup
  // Ref:
  // http://webpack.github.io/docs/webpack-dev-server.html#combining-with-an-existing-server
  // http://gaearon.github.io/react-hot-loader/#enabling-hot-module-replacement
  //
  webpackCfg.entry.index = [
    'webpack-dev-server/client?localhost:' + DEVSERVER_PORT,
    'webpack/hot/dev-server',
    webpackCfg.entry.index
  ];

  webpackCfg.devServer = {
    host: '0.0.0.0',
    port: DEVSERVER_PORT,
    hot: true,
    historyApiFallback: {
      verbose: true,
      rewrites: [{
        from: /\.html$/,
        to: function(context) {
          try {
            // Just try opening the file to see if it exists.
            fs.statSync(path.join(__dirname, context.parsedUrl.pathname)).isFile();

            // If file exists, don't rewrite.
            return context.parsedUrl.pathname;
          } catch(e) {
            return '/index.html';
          }
        }
      }]
    }
  };

  webpackCfg.plugins.push(new webpack.HotModuleReplacementPlugin());
  webpackCfg.plugins.push(new webpack.DefinePlugin({
    GOOGLE_API_KEY: JSON.stringify('AIzaSyBgewvC_6aFKXJnnzX0y2tp0xPM2ZLdk_w') // allows http://localhost:5000/*
  }));
  webpackCfg.output.publicPath = '/build/'
}

module.exports = webpackCfg;
