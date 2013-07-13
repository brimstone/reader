/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

'use strict';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		recess: {
			dist: {
				options: {
					compile: true,
					compress: true
				},
				files: {
					'static/css/all.css': ['less/manifest.less']
				}
			}
		},
		jshint: {
			gruntfile: ['Gruntfile.js'],
			libs_n_tests: ['static/js/*.js'],
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				node: true,
				}
			},
		bgShell: {
			deploy: {
				cmd: "node_modules/naught/lib/main.js deploy",
				bg: false,
			},
		},
		watch: {
			gruntfile: {
				files: ['<%= jshint.gruntfile %>'],
				tasks: ['jshint:gruntfile']
			},
			libs_n_tests: {
				files: ['<%= jshint.libs_n_tests %>'],
				tasks: ['jshint:libs_n_tests']
			},
			recess: {
				files: ['less/*.less'],
				tasks: ['recess'],
			},
			naught: {
				files:	['index.js'],
				tasks: ['bgShell:deploy'],
			},
		},
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-recess');
	grunt.loadNpmTasks('grunt-bg-shell');

	// "npm test" runs these tasks
	grunt.registerTask('test', ['jshint']);

	// Default task.
	grunt.registerTask('default', ['test', 'recess']);

};
