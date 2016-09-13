'use strict';
module.exports = function (grunt) {
  // Show elapsed time at the end
  require('time-grunt')(grunt);
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);


  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      gruntfile: {
        src: ['Gruntfile.js']
      },
      js: {
        src: ['*.js', 'generators/*.js']
      },
      test: {
        src: ['test/test.js']
      }
    },
    standard: {
      options: {
        // Task-specific options go here.
      },
      your_target: {
        // Target-specific file lists and/or options go here.
      },
      app: {
        src: [
            'index.js', 'generators/*.js'
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
      files: ['test/test.js']
    }
  });

  grunt.loadNpmTasks('grunt-tape');
  grunt.loadNpmTasks('grunt-standard');
  grunt.registerTask('test', ['standard', 'tape']);
  grunt.registerTask('default', ['jshint', 'test']);
};
