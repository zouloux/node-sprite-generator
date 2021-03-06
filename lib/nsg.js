'use strict';

var Promise = require('bluebird'),
    fs = require('fs'),
    writeFile = Promise.promisify(fs.writeFile),
    readFile = Promise.promisify(fs.readFile),
    glob = Promise.promisify(require('glob')),
    mkdirp = Promise.promisify(require('mkdirp')),
    path = require('path'),
    R = require('ramda'),
    changeDetector = require('./utils/changeDetector'),
    stylesheetUtils = require('./utils/stylesheet'),
    providedLayouts = require('./layout'),
    isNotNull = R.complement(R.isNil),
    MAX_PARALLEL_FILE_READS = 80,
    defaultOptions = {
        src: [],
        spritePath: null,
        layout: 'vertical',
        render: () =>
        {
            throw new Error('Please set render method in options. options.render = (spriteData, spriteBuffer) => { ... }')
        },
        layoutOptions: {
            padding: 0,
            scaling: 1,
            powerOfTwo: false
        },
        compositorOptions: {
            compressionLevel: 6,
            filter: 'all'
        }
    };

function readAllSources(src) {
    var stringSources = R.filter(R.is(String))(src),
        otherSources = R.difference(src, stringSources);

    return Promise.map(stringSources, R.unary(glob))
        .then(R.flatten)
        .then(R.uniq)
        .map(function (path) {
            return readFile(path).then(R.assoc('data', R.__, { path: path }));
        })
        .then(R.union(otherSources));
}

function findUpperPowerOfTwo (a)
{
    let b = 1;
    while (b < a) { b *= 2; }
    return b;
}

function generateSprite(userOptions, callback) {
    var options = R.pipe(
            R.merge(defaultOptions),
            R.evolve({
                compositorOptions: R.merge(defaultOptions.compositorOptions),
                layoutOptions: R.merge(defaultOptions.layoutOptions)
            }),
            stylesheetUtils.getRelativeSpriteDir
        )(userOptions),
        generateLayout = R.propOr(options.layout, options.layout, providedLayouts),
        compositor = require('./compositor/jimp'),
        readImage = R.propOr(null, 'readImage', compositor),
        renderSprite = R.propOr(null, 'render', compositor);
    return readAllSources(options.src)
        .map(readImage, { concurrency: MAX_PARALLEL_FILE_READS })
        .then(R.partialRight(generateLayout, [ options.layoutOptions ]))
        .tap(function createTargetDirectories() {
            return Promise.join(
                R.when(isNotNull, R.pipe(path.dirname, mkdirp), options.spritePath)
            );
        })
        .then(function renderStylesheetAndImage(generatedLayout) {
            if ( options.layoutOptions.powerOfTwo )
            {
                generatedLayout.width = findUpperPowerOfTwo( generatedLayout.width );
                generatedLayout.height = findUpperPowerOfTwo( generatedLayout.height );
            }
            return renderSprite(generatedLayout, options.spritePath, options.compositorOptions).then(
                (buffer) =>
                {
                    // Here we call directly options.render
                    options.render(generatedLayout, buffer, options);
                }
            );
        })
        .nodeify(callback);
}

generateSprite.middleware = function (options) {
    var changes = changeDetector(options);

    return function (req, res, next) {
        return changes.detect().then(function (changesDetected) {
            if (changesDetected) {
                return generateSprite(options)
                    .then(changes.register.bind(changes))
                    .then(next);
            }
            return next();
        }).catch(next);
    };
};

module.exports = generateSprite;
