//Requirements
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var rename = require('gulp-rename');
var jade = require('gulp-jade');

// Directories
var src = 'dev/';
var dist = '/';

//Options
var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

//browserSync
gulp.task('browser-sync', ['sass','jade'], function () {
	 browserSync.init({
        server: "./",
        notify: false,
    });
});

//Sass compile
gulp.task('sass', function() {
  gulp.src( 'dev/styles.scss' )
    .pipe( sass( sassOptions ).on('error', sass.logError) )
    .pipe( autoprefixer( ['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true} ) )
    .pipe( gulp.dest( './' ) )
    .pipe( browserSync.reload({ stream: true }) )
});


//Jade pase
gulp.task('jade', function() {
    return gulp.src('dev/index.jade')
      .pipe(jade())
      .pipe(gulp.dest('./'))
      .pipe( browserSync.reload({ stream: true }) );
});

//Gulp Watch Task
gulp.task( 'watch', function() {
  gulp.watch( 'dev/styles.scss', ['sass'] )
  gulp.watch( 'dev/index.jade', ['jade'] )
  gulp.watch( 'dev/scripts.js', browserSync.reload )

  gulp.on( 'change', function( event ) {
    console.log( 'File ' + event.path + 'was' + event.type + ' , running tasks...');
  });
});

gulp.task( 'default', ['browser-sync','watch'] );
