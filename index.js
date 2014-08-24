'use strict';

var Metalsmith = require('metalsmith'),
    markdown = require('metalsmith-markdown'),
    templates = require('metalsmith-templates'),
    collections = require('metalsmith-collections'),
    permalinks = require('metalsmith-permalinks'),
    Handlebars = require('handlebars'),
    fs = require('fs');


function getPartial(name) {
    return fs.readFileSync(__dirname + '/templates/partials/' + name + '.hbt').toString();
}

Handlebars
    .registerPartial('header', getPartial('header'));
Handlebars
    .registerPartial('footer', getPartial('footer'));

var rootFiles = {};

Metalsmith(__dirname)
    .use(collections({
        pages: {
            pattern: 'content/pages/*.md'
        },
        posts: {
            pattern: 'content/posts/*.md',
            sortBy: 'date',
            reverse: true
        }
    }))
    .use(findTemplate({
        pattern: 'posts',
        templateName: 'post.hbt'
    }))
    .use(markdown())
    .use(getRoot())
    .use(permalinks({
        pattern: ':collection/:title'
    }))
    .use(reAddFiles())
    .use(templates('handlebars'))
    .destination('./build')
    .build(function(err, files) {
        if (err) { throw err; }
    });

function getRoot(config){
    return function(files, metalsmith, done){
        for (var file in files) {
            if(!~file.indexOf('/')){
                rootFiles[file] = files[file];
                delete files[file];
            }
        }
        done();
    };
}

function reAddFiles(){
    return function(files, metalsmith, done){
        for (var file in rootFiles) {
            files[file] = rootFiles[file];
            delete rootFiles[file];
        }
        done();
    };
}

function findTemplate(config) {
    var rgx = new RegExp(config.pattern);

    return function(files, metalsmith, done) {
        for (var file in files) {
            if (rgx.test(file) && !files[file].template) {
                files[file].template = config.templateName;
            }
        }
        done();
    };
}