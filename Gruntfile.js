'use strict';
module.exports = function (grunt) {
  // Show elapsed time at the end
  require('time-grunt')(grunt);
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);


  grunt.initConfig({
    standard: {
      app: {
        src: [
          'index.js', 'generators/*.js', 'test.js'
        ]
      }
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      js: {
        files: '<%= jshint.js.src %>',
        tasks: ['jshint:js']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'standard' ]
      }
    },
    tape: {
      options: {
        pretty: true,
        output: 'console'
      },
      files: ['test.js']
    }
  });

  grunt.loadNpmTasks('grunt-tape');
  grunt.loadNpmTasks('grunt-standard');
  grunt.registerTask('test', ['tape']);
  grunt.registerTask('default', ['standard', 'test']);
};
