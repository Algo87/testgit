var {dest, parallel, src, task, watch} = require('gulp');
var sass=require('gulp-sass');
var browserSync=require('browser-sync');
var concat=require('gulp-concat');
var uglify=require('gulp-uglifyjs');
var cssnano=require('gulp-cssnano');
var rename=require('gulp-rename');
var autoprefixer=require('gulp-autoprefixer');
var del=require('del');
var imagemin=require('gulp-imagemin');
var pngquant=require('imagemin-pngquant');
var cache=require('cache');
var imgCompress  = require('imagemin-jpeg-recompress');


task('sass', async function(){
    return src(['app/scss/**/*.scss', 'app/scss/**/*.sass', 'app/libs/**/*.scss'])
        .pipe(sass())
        .pipe(autoprefixer(['last 15 versions'], {cascade:true}))
        .pipe(dest('app/css'))
        .pipe(browserSync.reload({stream:true}))
});

task('code', function(){
    return src('app/**/*.html')
        .pipe(browserSync.reload({stream:true}))
});

task('scripts', async function(){
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/jquery-mousewheel/jquery.mousewheel.js',
        'node_modules/jqueryui/jquery-ui.min.js',
        'node_modules/jquery-easing/jquery.easing.1.3.js',
        'node_modules/slick-carousel/slick/slick.js',
        'node_modules/jquery-validation/dist/jquery.validate.js',
        'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js'
        // 'node_modules/ymaps/dist/ymaps.js'
    ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.reload({stream:true}));
});

task('css-min', function(){
    return src('app/scss/main.scss')
        .pipe(sass())
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(dest('app/css'));
})

task('watch', async function(){

    watch(['app/scss/**/*.scss', 'app/scss/**/*.sass'], parallel('sass'));
    watch('app/*.html', parallel('code'));
    watch(['app/js/common.js', 'app/libs/**/*.js', 'app/js/form.json'], parallel('scripts'));
    watch('app/css/main.css', parallel('css-min'));
});

task('browser-sync', async function(){

    browserSync({
        server:{
            baseDir: 'app',
            index: 'index.html'
        },
        notify:false
    });
});

task('clear', async function(){
    return del.sync('dist');
});


task('img', async function() {
    return src('app/img/**/*')
        .pipe(imagemin([
                imgCompress({
                    loops: 4,
                    min:70,
                    max:80,
                    quality:'high'
                }),
                imagemin.gifsicle(),
                imagemin.optipng(),
                imagemin.svgo()
            ]


        ))
        .pipe(dest('dist/img'));
});



task('prebuild', async function(){

    var buildCss=src('app/css/main.min.css')
        .pipe(dest('dist/css'));

    var buildJs=src('app/js/**/*')
        .pipe(dest('dist/js'));

    var buildHtml=src('app/*.html')
        .pipe(dest('dist'));

    var buildFonts=src('app/fonts/**/*')
        .pipe(dest('dist/fonts'));


});

task('default', parallel('sass', 'scripts', 'css-min', 'browser-sync', 'watch'));
task('build', parallel('clear', 'prebuild', 'img', 'sass', 'scripts'));
