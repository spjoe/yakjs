/**
 * @constructor
 * @implements {yak.api.Request}
 */
yak.api.StopInstanceRequest = function StopInstanceRequest() {
    'use strict';

    /**
     * @type {string}
     */
    this.type = 'request.stopInstance';

    /**
     * Create unique request id.
     * @type {string}
     */
    this.id = yak.api.guid();

    /**
     * ID of the instance.
     * @type {string}
     */
    this.instanceId = null;
};
