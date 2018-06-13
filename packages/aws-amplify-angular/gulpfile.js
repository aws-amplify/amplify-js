const gulp = require('gulp');

const inlineTemplates = require('gulp-inline-ng2-template');
const exec = require('child_process').exec;


const INLINE_TEMPLATES = {
  SRC: './src/**/*.ts',
  DIST: './tmp/src-inlined',
  CONFIG: {
    base: '/src',
    target: 'es6',
    useRelativePaths: true
  }
};

gulp.task('inline-templates', () => {
  return gulp.src(INLINE_TEMPLATES.SRC)
    .pipe(inlineTemplates(INLINE_TEMPLATES.CONFIG))
    .pipe(gulp.dest(INLINE_TEMPLATES.DIST));
});

gulp.task('build', ['inline-templates'], (callback) => {
  exec('npm run ngcompile', function (error, stdout, stderr) {
    console.log(stdout, stderr);
    callback(error)
  });
});




