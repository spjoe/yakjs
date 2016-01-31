/**
 * The web server for the YAKjs UI.
 * @constructor
 * @param {!yak.YakServer} yakServer
 * @param {!yak.Config} config
 */
yak.HttpServer = function HttpServer(yakServer, config) {
    'use strict';

    /**
     * @type {yak.HttpServer}
     */
    var self = this;

    /**
     * @type {yak.Logger}
     */
    var log = new yak.Logger(self.constructor.name);

    var express = require('express');
    var http = require('http');
    var path = require('path');
    var bodyParser = require('body-parser');

    var app = express();

    /**
     * @type {Object<string, Object>}
     */
    var apiMap = {};

    /**
     * Constructor
     */
    function constructor() {
        log.debug('constructor');
        initializeAPIMap();
    }

    /**
     * Start listening.
     */
    this.start = function start() {
        try {
            app.set('port', config.httpPort);
            app.use(express.static(path.join('./ui/')));
            app.use(bodyParser.json({limit: '10MB'}));

            app.get('/scripts/yakjs-ui-config.js', getUIConfig);
            app.get('/api/*', handleAPIRequest);
            app.post('/api/*', handleAPIRequest);

            http.createServer(app).listen(app.get('port'), function listen(){
                log.info('YAKjs HTTP server running.', {httpPort: config.httpPort});
            });
        } catch(ex) {
            log.warn('Could not start YAKjs HTTP server.', {httpPort: config.httpPort, error: ex.message});
        }
    };

    /**
     * @route /api/
     * @param {ExpressRequest} request The HTTP request.
     * @param {ExpressResponse} response The HTTP response object.
     */
    function handleAPIRequest(request, response) {
        log.info('api > ' + request.body.type + '  ' + request.body.id);

        var requestType =  request.body.type;
        var apiResponse = '';

        if (apiMap[requestType]) {
             apiResponse = apiMap[requestType].handle(request.body);
        }

        var responseLogMessage = ['api', '<', apiResponse.type, (apiResponse.success ? 'success' : 'error')].join(' ');

        if (apiResponse.success) {
            log.info(responseLogMessage);
        } else {
            log.warn(responseLogMessage);
        }

        response.send(apiResponse);
    }

    /**
     * @route /scripts/yakjs-ui-config.js
     * @param {ExpressRequest} request The HTTP request.
     * @param {ExpressResponse} response The HTTP response object.
     */
    function getUIConfig(request, response) {
        var uiConfig = {
            webSocketUri: ['ws://', request.hostname, ':', config.servicePort].join('')
        };

        response.send(['var yak = yak || {}; yak.config = ', JSON.stringify(uiConfig), ';\n'].join(''));
    }

    /**
     * Initialize Mapping between request type and handler.
     */
    function initializeAPIMap() {
        // Instance
        apiMap['request.startInstance'] = new yak.StartInstanceRequestHandler(yakServer);
        apiMap['request.stopInstance'] = new yak.StopInstanceRequestHandler(yakServer);
        apiMap['request.getInstances'] = new yak.GetInstancesRequestHandler(yakServer.instanceManager);

        // Instance Configs
        apiMap['request.createInstanceConfig'] = new yak.CreateInstanceConfigRequestHandler(yakServer.instanceManager.configProvider, yakServer.instanceManager);
        apiMap['request.updateInstanceConfig'] = new yak.UpdateInstanceConfigRequestHandler(yakServer.instanceManager.configProvider, yakServer.instanceManager);
        apiMap['request.deleteInstanceConfig'] = new yak.DeleteInstanceConfigRequestHandler(yakServer.instanceManager.configProvider, yakServer.instanceManager);

        // Plugin
        apiMap['request.getPlugins'] = new yak.GetPluginsRequestHandler(yakServer);
        apiMap['request.createOrUpdatePlugin'] = new yak.CreateOrUpdatePluginRequestHandler(yakServer);
        apiMap['request.deletePlugin'] = new yak.DeletePluginRequestHandler(yakServer);

        // Store
        apiMap['yak.api.GetStoreKeysRequest'] = new yak.GetStoreKeysRequestHandler(yakServer);
        apiMap['yak.api.GetStoreItemRequest'] = new yak.GetStoreItemRequestHandler(yakServer);
        apiMap['yak.api.SetStoreItemRequest'] = new yak.SetStoreItemRequestHandler(yakServer);
        apiMap['yak.api.DeleteStoreItemRequest'] = new yak.DeleteStoreItemRequestHandler(yakServer);

        // File Upload
        apiMap['request.uploadFileRequest'] = new yak.FileUploadRequestHandler(yakServer);
    }

    constructor();
};