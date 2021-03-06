/**
 * Replaces the setTimeout and setInterval functions
 * with an error protected version. So when a plugin is using setTimeout or setInterval and produces an error YAKjs
 * will not crash.
 *
 * This is not a good implementation. This is a quick-fix. Replace it with "domains" from nodejs when there are
 * more stable. (see https://nodejs.org/api/domain.html)
 *
 * @constructor
 * @param {?} global
 */
yak.ErrorProtectionForTimerFunctions = function ErrorProtectionForTimerFunctions(global) {
    'use strict';

    var log = new yak.Logger('ErrorProtectionForTimerFunctions');

    /**
     * Keep an instance of the original setTimeout.
     * @type {function(Function, number, Object=)}
     */
    var globalSetTimeout = global.setTimeout;

    /**
     * Keep an instance of the original setInterval.
     * @type {function(Function, number, Object=)}
     */
    var globalSetInterval = global.setInterval;

    /**
     * Replaces the setTimeout and setInterval functions.
     */
    function constructor() {
        global.setTimeout = errorProtectedSetTimeout;
        global.setInterval = errorProtectedSetInterval;
    }

    /**
     * @param {function} callback
     * @param {number} delay
     * @param {Object} args
     * @returns {number} The interval timer id.
     */
    function errorProtectedSetInterval(callback, delay, args) {
        var protectedSetTimeoutCallback = function protectedSetTimeoutCallback() {
            try {
                callback(arguments);
            } catch (ex) {
                log.error('setInterval failed.', {error: ex.message});
            }
        };

        return globalSetInterval(protectedSetTimeoutCallback, delay, args);
    }

    /**
     * @param {function} callback
     * @param {number} delay
     * @param {Object} args
     * @returns {number} The timeout timer id.
     */
    function errorProtectedSetTimeout(callback, delay, args) {
        var protectedSetTimeoutCallback = function protectedSetTimeoutCallback() {
            try {
                callback(arguments);
            } catch (ex) {
                log.error('setTimeout failed.', {error: ex.message});
            }
        };

        return globalSetTimeout(protectedSetTimeoutCallback, delay, args);
    }

    constructor();
};
