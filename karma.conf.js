const timeout = 120000;
module.exports = function(config) {
  const localBrowsers = [
    'Chrome',
  ];
  const sauceLabsBrowsers = {
    SauceChromeLatest: {
      base: 'SauceLabs',
      browserName: 'Chrome',
    },
  };
  config.set({
    basePath: '',
    browsers: localBrowsers,
    frameworks: ['mocha', 'chai', 'sinon'],
    files: [
      './test/fakeChomeApi.js',
      './extension/js/bcrypt.js',
      './extension/js/supergenpass.js',
      './extension/js/password.class.js',
      './extension/js/site_profile.class.js',
      './test/*.test.js',
    ],
    preprocessors: {},
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    captureTimeout: timeout,
    browserDisconnectTimeout: timeout,
    browserNoActivityTimeout: timeout,
    singleRun: false,
    concurrency: Infinity
  });
  if (process.env.SAUCE_ACCESS_KEY && process.env.SAUCE_USERNAME) {
    console.log('Using SAUCELABS');
    config.reporters.push('saucelabs');
    config.set({
      customLaunchers: sauceLabsBrowsers,
      browsers: Object.keys(sauceLabsBrowsers),
      sauceLabs: {
        testName: require('./package').name,
      },
    });
  }
}
