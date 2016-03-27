var gulp = require('gulp');
var browserSync = require('browser-sync').create();

gulp.task('connect', function () {
  return browserSync.init({
    files: [
      'index.html',
      'src/partials/*.html',
      'src/partials/*/*.html',
      'src/*.css',
      'src/*/*.js',
      'src/*.js'
    ],
    port: 3000,
    logConnections: true,
    notify: false,
    server: './'
  });
});

gulp.task('default',['connect']);