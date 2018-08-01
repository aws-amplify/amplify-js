const gulp = require('gulp');
var uglify = require('gulp-uglify');
var pump = require('pump');
const inlineTemplates = require('gulp-inline-ng2-template');
const exec = require('child_process').exec;


const INLINE_TEMPLATES = {
  SRC: ['./src/**/*.ts', 
    '!./src/components/**/*ionic*.ts',
    '!./src/**/__tests__/**/*',
    '!./src/components/component.mount-factory.ionic.ts',
    '!./src/aws-amplify-ionic-module.ts'
  ],
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

gulp.task('compress', function (cb) {
  pump([
        gulp.src('lib/*.js'),
        uglify(),
        gulp.dest('dist')
    ],
    cb
  );
});

gulp.task('build', ['inline-templates'], (callback) => {
  exec('npm run ngcompile', function (error, stdout, stderr) {
    console.log(stdout, stderr);
    callback(error)
  });
});




