/**
 * @fileoverview Initialization the tasks that are related to git hooks
 */
var symlink = require('gulp-symlink');
var gulpdebug = require('gulp-debug');
var gulpif = require('gulp-if');
var path = require('path');
var del = require('del');
var config = rootRequire('./gulp/config');
var runSequence = require('run-sequence');
var gulpUtils = rootRequire('./gulp/gulp-utils');
var chmod = require('gulp-chmod');

/**
 * Initialize the gulp tasks regarding the js linting
 * @param {Object} gulp - the gulp instance
 */
var registerTasks = function registerTasks(gulp) {
  if (gulp) {

    // A task to make the pre-commit executable
    gulp.task('hooks:pre-commit-permissions', function() {
      return gulp.src('scripts/' + config.paths.preCommitHookFile, {base: './'})
        .pipe(chmod(755))
        .pipe(gulp.dest('./'));
    });

    // A task to install a pre-commit hook
    gulp.task('hooks:pre-commit', ['hooks:pre-commit-permissions'], function () {
      return gulp.src('scripts/' + config.paths.preCommitHookFile)
        .pipe(symlink(function(file){
          return path.join(gulpUtils.getGitRootDirectory(), config.paths.gitHooksDir, config.paths.preCommitHookFile);
        }));
    });

    // A task to delete all the git hooks directory
    gulp.task('hooks:clean', function() {
      var preCommitHookPath = path.join(gulpUtils.getGitRootDirectory(), config.paths.gitHooksDir,
                                        config.paths.preCommitHookFile);
      gulpUtils.print('Deleting file: ' + preCommitHookPath);
      return del([preCommitHookPath], {force: true});
    });

    // A task to install all the git hooks after a cleaning the existing git hooks
    gulp.task('hooks:install', ['hooks:clean'], function(callback){
      // We would like to run the installation of the pre-commit hook only after the clean task has finished
      runSequence(['hooks:pre-commit'], function() {
        callback();
      });
    });
  }
};

module.exports = registerTasks;