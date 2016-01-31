/**
 * CreateOrUpdatePluginRequestHandler
 * @constructor
 * @param {yak.YakServer} yakServer
 */
yak.CreateOrUpdatePluginRequestHandler = function CreateOrUpdatePluginRequestHandler(yakServer) {
    'use strict';

    /**
     * @type {yak.PluginCodeChecker}
     */
    var pluginCodeChecker = new yak.PluginCodeChecker();

    /**
     * @param {yak.api.CreateOrUpdatePluginRequest} request
     * @returns {!yak.api.CreateOrUpdatePluginResponse} response
     */
    this.handle = function handle(request) {
        var response;

        if (request.pluginId) {
            response = updatePlugin(request);
        } else {
            response = createPlugin(request);
        }

        return response;
    };

    /**
     * @param {!yak.api.CreateOrUpdatePluginRequest} request
     * @returns {!yak.api.CreateOrUpdatePluginResponse} response
     */
    function updatePlugin(request) {
        var pluginManager = yakServer.pluginManager;
        var response = new yak.api.CreateOrUpdatePluginResponse(request.id);
        var pluginValidator = new yak.api.PluginValidator(pluginManager);

        var plugin = pluginManager.getPlugin(request.pluginId);

        if (request.plugin.id !== request.pluginId) {
            pluginManager.changePluginId(request.pluginId, request.plugin.id);
        }

        if (pluginValidator.isUpdatePluginValid(request.plugin)) {
            if (pluginManager.hasJsDoc(request.plugin.code)) {
                var parsedPlugin = pluginManager.parsePluginContent(request.plugin.name, request.plugin.code);
                plugin = _.extend(plugin, parsedPlugin);
            }

            plugin.description = request.plugin.description;
            plugin.code = request.plugin.code;
            plugin.version = request.plugin.version;

            pluginManager.updatePlugin(plugin);
            pluginManager.savePlugin(plugin);
        } else {
            response.success = false;
            response.message = pluginValidator.getMessage();
        }

        return response;
    }

    /**
     * @param {!yak.api.CreateOrUpdatePluginRequest} request
     * @returns {!yak.api.CreateOrUpdatePluginResponse} response
     */
    function createPlugin(request) {
        var response = new yak.api.CreateOrUpdatePluginResponse(request.id);
        var pluginValidator = new yak.api.PluginValidator(yakServer.pluginManager);

        if (pluginValidator.isCreatePluginRequestValid(request.plugin)) {
            var newPlugin = null;

            if (yakServer.pluginManager.hasJsDoc(request.plugin.code)) {
                newPlugin = yakServer.pluginManager.parsePluginContent(request.plugin.name, request.plugin.code);
            } else {
                newPlugin = new yak.Plugin();
                newPlugin.id = request.plugin.name;
                newPlugin.name = request.plugin.name;
                newPlugin.version = request.plugin.version;
                newPlugin.description = request.plugin.description;
                newPlugin.code = request.plugin.code;
            }

            yakServer.pluginManager.addPlugin(newPlugin);
            yakServer.pluginManager.savePlugin(newPlugin);
        } else {
            response.success = false;
            response.message = pluginValidator.getMessage();
        }

        return response;
    }
};