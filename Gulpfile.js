
var fs = require('fs'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    banner = require('gulp-banner'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    htmlclean = require('htmlclean'),
    replace = require('gulp-replace'),
    minify = require('gulp-clean-css');

function escape (text) {
  return text.replace(/'/g, "\\'");
}

function htmlTemplate() {
  return replace('BOTUI_TEMPLATE', escape(
    htmlclean(fs.readFileSync('./src/botui.html', 'utf8'))
  ));
}

gulp.task('styles', function() {
  gulp.src(['./src/styles/normal.scss',
            './src/styles/botui.scss'])
      .pipe(sass().on('error', sass.logError))
      .pipe(minify())
      .pipe(concat('botui.min.css'))
      .pipe(gulp.dest('./build/'));
});

gulp.task('themes', function() {
  gulp.src('./src/styles/themes/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(minify())
      .pipe(rename(function (path) {
        path.basename = 'botui-theme-' + path.basename;
      }))
      .pipe(gulp.dest('./build/'));
});

gulp.task('scripts', function () {
      gulp.src('./src/scripts/botui.js') // simply copy the original one
      .pipe(htmlTemplate())
      .pipe(gulp.dest('./build/'));

      gulp.src('./src/scripts/botui.js')  // minified version
      .pipe(uglify())
      .pipe(htmlTemplate())
      .pipe(rename('botui.min.js'))
      .pipe(gulp.dest('./build/'));
});

gulp.task('watch',function() {
  gulp.watch('./src/styles/*.scss', ['styles']);
  gulp.watch('./src/styles/themes/*.scss', ['themes']);
  gulp.watch(['./src/scripts/botui.js', './src/botui.html'], ['scripts']);
});

gulp.task('default', ['styles', 'scripts', 'themes']);
