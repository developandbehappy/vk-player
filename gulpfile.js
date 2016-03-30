var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var gulpLess = require('gulp-less');

var def = {
  lessFrontend: 'lessFrontend',
  lessFrontendVendor: 'lessFrontendVendor'
};

var path = {
  less: './src/style/less/',
  lessDest: './src/style/',
  particles: './src/partials/'
};

gulp.task('connect', [def.lessFrontend, def.lessFrontendVendor], function () {
  browserSync.init({
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

  gulp.watch([
    path.less + "public.less",
    path.less + "public/*.less",
    path.less + "public/**/*.less"
  ], [def.lessFrontend]);

  gulp.watch([
    path.particles + "index.html",
    path.particles + "**/*.html",
    path.particles + "**/**/*.html"
  ], browserSync.reload);
});

gulp.task(def.lessFrontend, function () {
  return gulp.src(path.less + 'public.less')
    .pipe(gulpLess())
    .pipe(gulp.dest(path.lessDest))
    .pipe(browserSync.stream());
});

gulp.task(def.lessFrontendVendor, function () {
  return gulp.src(path.less + 'public_vendor.less')
    .pipe(gulpLess())
    .pipe(gulp.dest(path.lessDest))
    .pipe(browserSync.stream());
});

gulp.task('build', [def.lessFrontend, def.lessFrontendVendor]);
gulp.task('default', ['connect']);
