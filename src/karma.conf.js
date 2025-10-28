module.exports = function(config) {
  config.set({
    // Framework específico
    frameworks: ['jasmine'],
    
    // Archivos de prueba
    files: [
      'src/**/*.spec.js'
    ],
    
    // Preprocesadores si necesitas JS moderno
    preprocessors: {
      'src/**/*.js': ['webpack']
    },
    
    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      }
    },
    
    // Reportes
    reporters: ['progress', 'kjhtml'],
    
    // Navegadores
    browsers: ['Chrome'],
    
    // Configuración de auto-ejecución
    autoWatch: true,
    singleRun: false,
    
    // Plugins
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-jasmine-html-reporter',
      'karma-webpack'
    ]
  });
};