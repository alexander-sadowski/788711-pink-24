import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import cheerio from 'gulp-cheerio';
import del from 'del';
import browser, { create } from 'browser-sync';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML

const minhtml = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}

// Scripts

const scripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'))
}

// Images

const optimizeImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'))
    .pipe(gulp.dest(function (file) {
      return file.base;
    }));
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(gulp.dest('build/img'))
    .pipe(gulp.dest(function (file) {
      return file.base;
    }));
}

// Avif, WebP

const createWebp = () => {
  return gulp.src(['source/img/**/*.{png,jpg}', '!source/img/backgrounds/*', '!source/img/favicons/*', '!source/img/phones/*'])
    .pipe(squoosh({
      webp: {},
    }))
    .pipe(gulp.dest('build/img'))
    .pipe(gulp.dest(function (file) {
      return file.base;
    }));
}

const createAvif = () => {
  return gulp.src(['source/img/**/*.{png,jpg}', '!source/img/backgrounds/*', '!source/img/favicons/*', '!source/img/phones/*'])
    .pipe(squoosh({
      avif: {},
    }))
    .pipe(gulp.dest('build/img'))
    .pipe(gulp.dest(function (file) {
      return file.base;
    }));
}

// SVG

const svg = () => {
  return gulp.src(['source/img/**/*.svg', '!source/img/svg/*.svg', '!source/img/svg/logos/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'))
    .pipe(gulp.dest(function (file) {
      return file.base;
    }));
}

const sprite = () => {
  return gulp.src('source/img/svg/*.svg')
    .pipe(svgo())
    .pipe(cheerio({
      run: ($) => {
        $('[fill]').removeAttr('fill');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img/svg'));
}

// Copy

const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/img/svg/logos/logo.svg',
    'source/img/svg/logos/marketplace-logos.svg',
    'source/*.ico',
    'source/*.webmanifest',
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}

// Clean

const clean = () => {
  return del('build');
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/*.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(minhtml, reload));
}

// Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    minhtml,
    scripts,
    svg,
    sprite,
    createWebp,
    createAvif
  ),
);

// Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    minhtml,
    scripts,
    svg,
    sprite,
    createWebp,
    createAvif
  ),
  gulp.series(
    server,
    watcher
  ));
