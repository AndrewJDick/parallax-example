const  gulp 			   = require('gulp'),
       browserify    = require('gulp-browserify'),
	     sass 			   = require('gulp-sass'),
	     cleanCss 	   = require('gulp-clean-css'),
	     newer 			   = require('gulp-newer'),
	     concat 		   = require('gulp-concat'),
	     htmlmin 		   = require('gulp-htmlmin'),
	     uglify 		   = require('gulp-uglify'),
	     autoprefixer  = require('gulp-autoprefixer'),
	     plumber 		   = require('gulp-plumber'),
	     imagemin 		 = require('gulp-imagemin'),
	     rename 			 = require('gulp-rename'),
	     connectMulti  = require('gulp-connect-multi'),
       sourcemaps    = require('gulp-sourcemaps'),
	     connect 		   = connectMulti();


// HTML
gulp.task('html', () => {
	return gulp.src('./src/*.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('dist/'));
})

gulp.task('html:reload', ['html'], () => {
    return gulp.src('./src/*.html')
    	.pipe(connect.reload());
});


// Media
gulp.task('media', () => {
	return gulp.src(['./src/media/*'])
        .pipe(newer('./dist/media'))
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/media'));
});

gulp.task('media:reload', ['media'], () => {
    return gulp.src(['./src/media/*'])
    	.pipe(connect.reload());
});


// Styles
gulp.task('styles:css', () => {
  	return gulp.src('./src/scss/main.scss')
	  	.pipe(plumber())
	  	.pipe(autoprefixer({
	        browsers: ['last 2 versions'],
	    }))
	    .pipe(sass().on('error', sass.logError))
	    .pipe(cleanCss())
	    .pipe(gulp.dest('./dist/css'));
});

gulp.task('styles:font', () => {
  	return gulp.src('./src/fonts/*')
	    .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('styles', ['styles:css', 'styles:font']);

gulp.task('styles:reload', ['styles'], () => {
    return gulp.src(['./src/scss/**/*.scss', './src/fonts/*'])
    	.pipe(connect.reload());
});


// Javascript
gulp.task('scripts:vendor', () => {
	return gulp.src('./src/js/vendor/*.js')
		.pipe(plumber())
		.pipe(uglify())
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest('./dist/js/'));
});

gulp.task('scripts:main', () => {
	return gulp.src('./src/js/app.js')
		.pipe(plumber())
    .pipe(browserify({
      insertGlobals : true 
    }))
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write())
		//.pipe(uglify())
		.pipe(gulp.dest('./dist/js'));
});;

gulp.task('scripts', ['scripts:vendor', 'scripts:main']);

gulp.task('scripts:reload', ['scripts'], () => {
    return gulp.src(['./src/js/**/*.js'])
    	.pipe(connect.reload());
});


// Live Reload
function connectOptions(browser, port, live) {
	return {
		root: ['./dist'],
		port: port,
		livereload:{
    		port: live
 		},
		open: {
			browser: browser,
			file: 'index.html'
		}
	};
}

gulp.task('connect', connect.server(connectOptions('Google Chrome', 8000, 35729)));


// Watch Tasks
gulp.task('watch', () => {
	gulp.watch('./src/*.html', ['html:reload']);
	gulp.watch('./src/scss/**/*.scss', ['styles:reload']);
	gulp.watch('./src/js/**/*.js', ['scripts:reload']);
	gulp.watch('./src/img/*', ['media::reload']);
});


// Default
gulp.task('default', ['html', 'media', 'styles', 'scripts', 'connect', 'watch']);

gulp.task('deploy', ['html', 'media', 'styles', 'scripts']);


