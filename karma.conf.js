module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    
    files: [
      'src/**/*.test.js', 
      'src/**/*.spec.js'
    ],

    preprocessors: {
      'src/**/*.test.js': ['webpack', 'sourcemap'],
      'src/**/*.spec.js': ['webpack', 'sourcemap']
    },
    
    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {targets: {node: 'current'}}],
                  '@babel/preset-react'
                ]
              }
            }
          }
        ]
      },
      resolve: {
        extensions: ['.js', '.jsx']
      }
    },
    
    plugins: [
      'karma-jasmine',
      'karma-webpack',
      'karma-chrome-launcher',
      '@chiragrupani/karma-chromium-edge-launcher',
      'karma-sourcemap-loader',
      'karma-jasmine-html-reporter' // ✅ NUEVO
    ],
    
    reporters: ['progress', 'kjhtml'], // ✅ NUEVO
    
    client: {
      jasmine: {
        random: false
      },
      clearContext: false // ✅ NUEVO
    },
    
    browsers: ['Edge'],
    singleRun: false
  });
};