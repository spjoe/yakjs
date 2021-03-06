/**
 * GetInstancesRequestHandler
 * @constructor
 * @param {yak.YakServer} yakServer
 */
yak.GetInstancesRequestHandler = function GetInstancesRequestHandler(yakServer) {
    'use strict';

    /**
     * @type {!yak.InstanceManager}
     */
    var instanceManager = yakServer.instanceManager;

    /**
     * @param {yak.api.GetInstancesRequest} request
     * @returns {yak.api.GetInstancesResponse} response
     */
    this.handle = function handle(request) {
        var instances = instanceManager.getInstances();

        var response = new yak.api.GetInstancesResponse(request.id);
        response.instances = _.map(_.compact(instances), toInstanceInfo);

        return response;
    };

    /**
     * @param {yak.WebSocketInstance} instance
     * @returns {yak.api.InstanceInfo} The instance info.
     */
    function toInstanceInfo(instance) {
        var instanceInfo = new yak.api.InstanceInfo();
        instanceInfo.id = instance.id;
        instanceInfo.name = instance.name;

        var connections = instance.getConnections();
        instanceInfo.connectionCount = connections ? connections.length : 0;

        if (instance.plugins) {
            instanceInfo.pluginTotalCount = instance.plugins.length;
        }

        instanceInfo.pluginActiveCount = instance.activePluginCount;
        instanceInfo.port = instance.port;
        instanceInfo.state = instance.state;
        instanceInfo.plugins = instance.plugins;
        instanceInfo.activePlugins = instance.getPluginInstances().map(function pickName(item) {
            return item.name;
        });
        instanceInfo.description = instance.description;

        var instanceConfig = instanceManager.configProvider.getConfig(instance.id);
        instanceInfo.inactivePlugins = _.difference(instanceConfig.plugins, instanceInfo.activePlugins);

        return instanceInfo;
    }
};
