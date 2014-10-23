var gulp = require('gulp'),
  compass = require('gulp-compass'),
  watch = require('gulp-watch'),
  handlebars = require('gulp-ember-handlebars'),
  uglify = require('gulp-uglify'),
  minifyCSS = require('gulp-minify-css'),
  livereload = require('gulp-livereload'),
  open = require('gulp-open'),
  plumber = require('gulp-plumber'),
  neuter = require('gulp-neuter'),
  autoprefixer = require('gulp-autoprefixer'),
  gutil = require('gulp-util'),
  stripDebug = require('gulp-strip-debug'),
  concat = require('gulp-concat');

/*
Usage:

Development:
gulp

Production
gulp build
*/

function plumberError(error) {
	gutil.log(gutil.colors.red(error.message));
	this.emit('end');
}


gulp.task('css', function() {
  gulp.src('app/styles/*.scss')
  .pipe(plumber())
  .pipe(compass({
    config_file: './config.rb',
    sass: 'app/styles',
    css: 'dist/styles'
  }))
  .pipe(minifyCSS())
  .pipe(autoprefixer())
  .pipe(gulp.dest('dist/styles'));
});

gulp.task('templates', function() {
  gulp.src(['app/templates/**/*.hbs'])
  	.pipe(plumber())
    .pipe(handlebars({
      outputType: 'browser',
      namespace: 'Ember.TEMPLATES'
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('dist/scripts'));
});

var scriptSrc = [
  	'app/scripts/*.js',
    'app/scripts/libs/**/*.js',
    'app/scripts/adapters/**/*.js',
    'app/scripts/components/**/*.js',
    'app/scripts/controllers/**/*.js',
    'app/scripts/models/**/*.js',
    'app/scripts/routes/**/*.js',
    'app/scripts/helpers/**/*.js',
    'app/scripts/serializers/**/*.js',
    'app/scripts/transformers/**/*.js',
    'app/scripts/views/**/*.js',
];

gulp.task('scripts_dev', function() {
  return gulp.src(scriptSrc)
  	.pipe(plumber({'errorHandler': plumberError}))
    .pipe(neuter("app.js").on('error', gutil.log))
    .pipe(concat('main.js').on('error', gutil.log))
    .pipe(gulp.dest('dist/scripts').on('error', gutil.log));
});

gulp.task('scripts_prod', function() {
  return gulp.src(scriptSrc)
    .pipe(stripDebug())
    .pipe(neuter("app.js"))
    .pipe(uglify())
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task("url", function(){
  var options = {
    url: "https://getstream.parseapp.com",
    app: "google-chrome"
  };
  gulp.src("./app/index.html")
  .pipe(open("", options));
});

var signal = 'change';
function handler() {
	setTimeout(
	livereload.changed
	, 200);
}

gulp.task('watch', function() {
  // start the live reload
  livereload.listen();
  //watches SCSS files for changes
  gulp.watch('app/styles/**/*.*', ['css']).on(signal, handler);
  //watches handlebars files for changes
  gulp.watch('app/templates/**/*.hbs', ['templates']).on(signal, handler);
  //watches JavaScript files for changes
  gulp.watch('app/scripts/**/*.js', ['scripts_dev']).on(signal, handler);
  // open the url
  gulp.run("url");
});

gulp.task('default', ['css', 'templates', 'scripts_dev', 'watch']);

gulp.task('build', ['css', 'templates', 'scripts_prod']);

