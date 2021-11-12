const gulp = require('gulp'),
    pug = require('gulp-pug'),
    del = require('del'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    htmlhint = require('gulp-htmlhint'),
    htmlmin = require('gulp-htmlmin'),
    sass = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),
    gcmq = require('gulp-group-css-media-queries'),
    sourcemaps = require('gulp-sourcemaps'),
    cleanCSS = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    imgCompress = require('imagemin-jpeg-recompress'),
    imageminPngquant = require('imagemin-pngquant'),
    newer = require('gulp-newer'),
    svgSprite = require('gulp-svg-sprite'),
    svgmin = require('gulp-svgmin'),
    svgo = require('svgo'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace'),
    webp = require('gulp-webp'),
    browserSync = require('browser-sync').create(),
    webpack = require('webpack-stream');


/* FILES PATHS */

// Project info

const buildFolder = './build';

/*
* Название текущего проекта 
* (необходимо прописать его также в ссылках на js, css и fonts файлы в файлах footer и head в папке layouts)
*/
const projectName = 'factory_windows';

const themePath = `${buildFolder}/wp-content/themes/${projectName}/assets/`; // For wordpress
// const themePath = `${buildFolder}`; // For other cases
const htmlMin = false; // HTML minification (false by default)

const paths = {
    prod: {
        build: `${buildFolder}`
    },
    pug: {
        src: './src/pages/*.pug',
        dest: `${buildFolder}`,
        watch: ['./src/components/**/*.pug', './src/mixins-pug/**/*.pug', './src/pages/**/*.pug', './src/layouts/**/*.pug']
    },
    scss: {
        src: './src/scss/main.scss',
        dest: `${themePath}/css`,
        watch: ['./src/scss/**/*.scss', './src/components/**/*.scss']
    },
    js: {
        src: './src/js/index.js',
        dest: `${themePath}/js`,
        watch: './src/js/**/*.js'
    },
    images: {
        src: ['./src/img/**/*', '!./src/img/**/*.svg', '!./src/img/**/*.webp'],
        dest: `${themePath}/img`,
        watch: ['./src/img/**/*', '!./src/img/**/*.svg', '!./src/img/**/*.webp']
    },
    webpImages: {
        src: './src/img/**/*.webp',
        dest: `${themePath}/img`,
        watch: './src/img/**/*.webp'
    },
    svgSprite: {
        src: './src/img/icons/**/*.svg',
        dest: `${themePath}/img/icons`,
        watch: './src/img/icons/**/*.svg'
    },
    svg: {
        src: ['./src/img/**/*.svg', '!./src/img/icons/**/*.svg'],
        dest: `${themePath}/img/icons`,
        watch: ['./src/img/**/*.svg', '!./src/img/icons/**/*.svg']
    },
    fonts: {
        src: './src/fonts/**/*',
        dest: `${themePath}/fonts`,
        watch: './src/fonts/**/*'
    },
    php: {
        src: './src/php/**/*.php',
        dest: `${themePath}/php`,
        watch: './src/php/**/*.php'
    },
    video: {
        src: './src/video/**/*.*',
        dest: `${themePath}/video`,
        watch: './src/video/**/*.*'
    }
};

// Project build type (development or production)
let isDev = true; // Оставить true для development или заменить на false для production версии сборки проекта
let isProd = !isDev;

/* 
Название конечного js-файла для development или production версии сборки 
Подключить соответствующее имя файла на нужных страницах (например, index.pug или index.html)
*/
let jsFilename = isDev ? 'main.js' : 'main.min.js';

/* Webpack options */
let webpackConfig = {
    entry: {
        main: './src/js/index.js',
    },
    output: {
        filename: jsFilename
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: '/node_modules/', // Не обязательно (для вытягивания откомпелированного в babel кода из зависимостей)
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    optimization: {
        minimize: isProd
    },
    devServer: {
        port: 4200,
        overlay: true, // Вывод ошибки на оверлей на экране
        open: true // Открытие проекта в браузере при запуске в development режиме
    },
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'source-map' : 'none'
};

/* TASKS */

/* PUG TO HTML & MINIFICATION */

gulp.task('pug', () => {
    return gulp.src(paths.pug.src)
        .pipe(plumber())
        .pipe(pug({
            pretty: true
        }))
        .pipe(htmlhint())
        .pipe(htmlhint.reporter('htmlhint-stylish'))
        .pipe(htmlhint.failOnError({
            suppress: true
        }))
        .pipe(htmlmin({
            collapseWhitespace: htmlMin  //Минификация html (по умолчанию отключена)
        }))
        .pipe(gulp.dest(paths.pug.dest))
        .pipe(browserSync.stream())
});

/* SCSS TO CSS CONVERTATION & MINIFICATION */

gulp.task('styles', () => {
    return gulp.src(paths.scss.src)
        .pipe(plumber())
        .pipe(sourcemaps.init()) // Можно закомментировать создание карту при production сборке
        .pipe(concat('main.scss'))
        .pipe(sass({
            includePaths: ['node_modules']
        }))
        .pipe(autoprefixer({
            // Browserslist: ['> 1%, not dead'],
            cascade: false
        }))
        .pipe(gcmq())
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(cleanCSS())
        .pipe(rename('main.min.css'))
        .pipe(sourcemaps.write('.')) // Можно закомментировать создание карту при production сборке
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(browserSync.stream())
});

/* JAVASCRIPT MINIFICATION VIA WEBPACK */

gulp.task('scripts', () => {
    return gulp.src(paths.js.src)
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest(paths.js.dest))
        .pipe(browserSync.stream())
});

/* IMAGES MINIFICATION */

gulp.task('imgmin', () => {
    return gulp.src(paths.images.src)
        .pipe(plumber())
        .pipe(newer(paths.images.dest))
        .pipe(imagemin([
            imgCompress({
                loops: 4,
                min: 70,
                max: 80,
                quality: 'high'
            }),
            imageminPngquant({ quality: [0.70, 0.80], speed: 4 }),
        ]))
        .pipe(gulp.dest(paths.images.dest))
        .pipe(browserSync.stream())
});

/* IMAGES JPG/JPEG & PNG TO WEBP CONVERTATION */

gulp.task('webp', () => {
    return gulp.src(paths.images.src)
        .pipe(plumber())
        .pipe(webp())
        .pipe(gulp.dest(paths.images.dest))
        .pipe(browserSync.stream())
});

/* SVG SPRITES */

gulp.task('sprites', () => {
    return gulp.src(paths.svgSprite.src)
        .pipe(plumber())
        .pipe(newer(paths.svgSprite.dest))
        .pipe(imagemin([
            imagemin.svgo({
                plugins: [
                    {
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        // .pipe(svgmin({
        //     plugins: [{
        //         cleanupIDs: false,
        //         js2svg: {
        //             pretty: true
        //         }
        //     }]
        // }))
        .pipe(cheerio({
            run: ($) => {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {
                xmlMode: true
            }
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: '../sprite.svg'
                }
            }
        }))
        .pipe(gulp.dest(paths.svgSprite.dest))
        .pipe(browserSync.stream())
});

/* SVG MINIFICATION */

gulp.task('svg', () => {
    return gulp.src(paths.svg.src)
        .pipe(plumber())
        .pipe(newer(paths.svg.dest))
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(gulp.dest(paths.svg.dest))
        .pipe(browserSync.stream())
});

/* FONTS MOVING TO BUILD */

gulp.task('fonts', () => {
    return gulp.src(paths.fonts.src)
        .pipe(plumber())
        .pipe(newer(paths.fonts.dest))
        .pipe(gulp.dest(paths.fonts.dest))
        .pipe(browserSync.stream())
});

/* PHP MOVING TO BUILD */

gulp.task('php', () => {
    return gulp.src(paths.php.src)
        .pipe(plumber())
        // .pipe(newer(paths.php.dest))
        .pipe(gulp.dest(paths.php.dest))
        .pipe(browserSync.stream())
});

/* VIDEO MOVING TO BUILD */

gulp.task('video', () => {
    return gulp.src(paths.video.src)
        .pipe(plumber())
        .pipe(newer(paths.video.dest))
        .pipe(gulp.dest(paths.video.dest))
        .pipe(browserSync.stream())
});

/* BUILD FOLDER ERASE */

gulp.task('clean', () => {
    return del(paths.prod.build);
});

/* BROWSER SYNC */

function reload(done) {
    browserSync.reload({ stream: true });
    done();
}

gulp.task('server', () => {
    browserSync.init({
        server: {
            baseDir: paths.prod.build
        },
        reloadOnRestart: true
    });
    gulp.watch(paths.pug.watch, gulp.series('pug', reload));
    gulp.watch(paths.scss.watch, gulp.series('styles', reload));
    gulp.watch(paths.scss.watch, gulp.series('pug', reload));
    gulp.watch(paths.js.watch, gulp.series('scripts', reload));
    gulp.watch(paths.images.watch, gulp.series('imgmin', reload));
    gulp.watch(paths.images.watch, gulp.series('webp', reload));
    gulp.watch(paths.svgSprite.watch, gulp.series('sprites', reload));
    gulp.watch(paths.svg.watch, gulp.series('svg', reload));
    gulp.watch(paths.fonts.watch, gulp.series('fonts', reload));
    gulp.watch(paths.php.watch, gulp.series('php', reload));
    gulp.watch(paths.video.watch, gulp.series('video', reload));
});

/* PROJECT TASK DEVELOPMENT QUEUE */

gulp.task('dev', gulp.series(
    'styles',
    'pug',
    'scripts',
    'imgmin',
    'webp',
    'sprites',
    'svg',
    'fonts',
    'php',
    'video'
));

gulp.task('prod', gulp.series(
    'clean',
    'styles',
    'pug',
    'scripts',
    'imgmin',
    'webp',
    'sprites',
    'svg',
    'fonts',
    'php',
    'video'
));

/* START DEVELOPMENT GULP */

gulp.task('default', gulp.series(
    'dev', 'server'
));

/* START PRODUCTION GULP */

gulp.task('prod', gulp.series(
    'prod', 'server'
));
