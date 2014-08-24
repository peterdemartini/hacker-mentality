'use strict';

var Metalsmith  = require('metalsmith'),
    markdown = require('metalsmith-markdown'),
    templates = require('metalsmith-templates'),
    collections = require('metalsmith-collections'),
    permalinks = require('metalsmith-permalinks'),
    Handlebars = require('handlebars'),
    fs = require('fs');


function getPartial(name){
    return fs.readFileSync(__dirname + '/templates/partials/' + name + '.hbt').toString();
}

Handlebars
    .registerPartial('header', getPartial('header'));
Handlebars
    .registerPartial('footer', getPartial('footer'));

function findTemplate(config) {
    var rgx = new RegExp(config.pattern);

    return function(files, metalsmith, done) {
        for (var file in files) {
            if (rgx.test(file)) {
                if (!files[file].template) {
                    files[file].template = config.templateName;
                }
            }
        }
        done();
    };
}

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
    .use(permalinks({
        pattern: ':collection/:title'
    }))
    .use(templates('handlebars'))
    .destination('./build')
    .build(function(err, files) {
        if (err) { throw err; }
    });