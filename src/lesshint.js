'use strict';

var fs = require('fs');
var gonzales = require('gonzales-pe');
var RcFinder = require('rcfinder');
var stripJsonComments = require('strip-json-comments');

module.exports = function lesshint (path, options) {
    var config;
    var rcfinder;
    var linters = [
        require('./linters/space_before_brace')
    ];

    if (!options.c || !options.config) {
        rcfinder = new RcFinder('.lesshintrc', {
            loader: function configLoader (path) {
                var data = fs.readFileSync(path, 'utf8');

                data = stripJsonComments(data);

                return JSON.parse(data);
            }
        });

        config = rcfinder.find(__dirname);
    }

    fs.readFile(path, 'utf8', function fileLoader (err, data) {
        var ast;

        if (err) {
            throw err;
        }

        ast = gonzales.parse(data, {
            syntax: 'less'
        });

        ast.map(function runLinter (node) {
            var i;

            for (i = 0; i < linters.length; i++) {
                linters[i].call(null, node, config);
            }
        });
    });
};