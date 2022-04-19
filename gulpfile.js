const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const nunjucksRender = require('gulp-nunjucks-render');
const plumber = require('gulp-plumber');
const uglifycss = require('gulp-uglifycss');
const gutil = require('gulp-util');
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');

/* Dev Variables */
const distFolder = './dist';
const sourceFolder = 'src/';
const nunjucksSRC = sourceFolder + '*.njk';
const cssFolder = distFolder + '/css';
const sassSourceFile = './scss/styles.scss';

/* Serve files from dist folder */
gulp.task('serve', function () {
  browserSync.init({
    server: {
      baseDir: distFolder,
    },
  });
});

/* Generate HTML files out of nunjucks templates */
gulp.task('njk', function () {
  return gulp
    .src(nunjucksSRC)
    .pipe(
      nunjucksRender({
        path: sourceFolder,
        data: {
          versioning: Math.floor(
            Math.random() *
              Math.floor(99999999999999999999999999999999999999999)
          ),
        },
        ext: '.html',
      })
    )
    .pipe(gulp.dest(distFolder));
});

/* Generates CSS files out of SASS files plus extra minified version */
gulp.task('styles', function () {
  return gulp
    .src(sassSourceFile)
    .on('error', gutil.log)
    .pipe(sassGlob())
    .pipe(sourcemaps.init())
    .pipe(
      plumber({
        errorHandler: function (err) {
          notify.onError({
            title: 'Gulp error in ' + err.plugin,
            message: err.toString(),
          })(err);

          // play a sound once
          gutil.beep();
        },
      })
    )
    .pipe(sass().on('error', sass.logError))
    .on('error', gutil.log)
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(gulp.dest(cssFolder))
    .pipe(rename({ suffix: '.min' }))
    .pipe(
      uglifycss({
        maxLineLen: 80,
        uglyComments: true,
      })
    )
    .pipe(gulp.dest(cssFolder))
    .pipe(browserSync.stream());
});

/* Watching files for changes */
gulp.task('watch', function () {
  gulp.watch('./scss/**', gulp.series('styles'));
  gulp.watch('./scss/*.scss', gulp.series('styles'));
  gulp.watch('./src/**', gulp.series('njk'));
  gulp.watch('./dist/*.js').on('change', browserSync.reload);
  gulp.watch('dist/*.html').on('change', browserSync.reload);
});

gulp.task('default', gulp.parallel('watch', 'styles', 'serve'));
