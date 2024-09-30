const parseTypedInputs = require("./util/parseTypedInputs");

module.exports = function (RED) {
    function socketIoMiddlewareSocketEnd(config) {
        RED.nodes.createNode(this, config);
        // node-specific code goes here
        const node = this;

        node.on("input", (msg) => {
            if (!msg._socketId) {
                node.error("No socket id found (2342)");
                return;
            }

            if (!msg._contextStorageName) {
                node.error("No context storage name found (2342)");
                return;
            }

            if (!msg._socketNext) {
                node.error("No socket next found (3324)");
                return;
            }

            if (!msg.request) {
                node.error("No request data found (4423)");
                return;
            }

            if (msg.payload) {
                node.send(msg);
                msg._socketNext();
                return;
            }

            // Socket cannot throw error in next() function, so we need to emit an event to handle it
            try {
                const socket = node.context().global.get(`socket_${msg._socketId}`, msg._contextStorageName);
                socket.emit("error", msg.errMsg ? msg.errMsg : 'Your action is not allowed (345456)');
                return;
            } catch (error) {
                node.error(error);
            }
        });

    }

    RED.nodes.registerType("socket.io middleware-socket-end", socketIoMiddlewareSocketEnd);
};
