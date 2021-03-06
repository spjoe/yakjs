/**
 * @name bridge
 * @description Every received message will be posted on the event bus.
 * @example
 *      Client A is connected to instance bridge A.
 *      Client B is connected to instance bridge B.
 *      Client A sends a message. This message is posted on the event bus. Received by bridge B and sent to Client B.
 * @version 1.0.0
 * @constructor
 * @implements {yak.PluginWorker}
 * @param {yak.require} require
 * @param {yak.PluginContext} context
 */
function BridgePlugin(require, context) {
    'use strict';

    var eventBus = require('eventBus');
    var guid = require('guid');
    var log = require('log');

    var currentEventId = null;

    this.onStart = function onStart() {
        eventBus.subscribe(function onEventBusMessage(event) {
            if (event.eventId !== currentEventId) {
                log.info('Event received', {event: event, currentEventId: currentEventId});
                var connections = context.instance.getConnections();

                connections.forEach((connection) => {
                    connection.send(event.data);
                });
            }
        });
    };

    /**
     * @param {yak.WebSocketConnection} connection
     */
    this.onNewConnection = function onNewConnection(connection) {};

    /**
     * @param {yak.WebSocketMessage} message
     * @param {yak.WebSocketConnection} connection
     */
    this.onMessage = function onMessage(message, connection) {
        currentEventId = guid();

        var event = {
            eventId: currentEventId,
            data: message.data
        };

        log.info('Post event', {event: event});
        eventBus.post(event);
    };

    /**
     * Connection closed event. Note that the connection is no longer part of instance.getConnections().
     * @param {yak.WebSocketConnection} connection
     */
    this.onConnectionClosed = function onConnectionClosed(connection) {};

    this.onStop = function onStop(instance) {};
}

