const parseTypedInputs = require("./util/parseTypedInputs");

module.exports = function (RED) {
    function socketIoMiddlewareSocketEnd(config) {
        RED.nodes.createNode(this, config);
        // node-specific code goes here
        const node = this;

        node.on("input", (msg) => {
            console.debug({msg});

            // Empty packet or socket next, check socket is connected
            // if (!msg.socketNext || !msg.request) {
            //     if (!msg.socketId) {
            //         node.error("Invalid connection (123123)");
            //         return;
            //     }
            //     const socket = node.context().global.get(`socket_${msg.socketId}`);
            //     if (!socket) {
            //         node.error("Invalid connection (353423)");
            //         return;
            //     }

            //     // If socket is not connected, this is connection event
            //     if (!socket.connected) {
            //         return;
            //     }

            //     node.error("Invalid connection (6456443)");
            //     return;
            // }

            if (!msg.socketNext) {
                node.error("No msg.socketNext (3324)");
                return;
            }

            if (!msg.request) {
                node.error("No msg.request (4423)");
                return;
            }

            if (msg.payload) {
                // msg.next(new Error(msg.errMsg ? msg.errMsg : 'invalid (232423)'));
                console.debug("sadasdsadasd");
                console.debug({msg});
                node.send(msg);
                msg.socketNext();
                return;
            }
            // msg.socketNext(new Error(msg.errMsg ? msg.errMsg : 'invalid (232423)'));
        });

    }

    RED.nodes.registerType("socket.io middleware-socket-end", socketIoMiddlewareSocketEnd);
};
