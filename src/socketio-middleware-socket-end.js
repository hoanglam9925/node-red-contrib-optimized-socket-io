const { showNodeStatus } = require("./util/nodeStatus");
const parseTypedInputs = require("./util/parseTypedInputs");

module.exports = function (RED) {
    function socketIoMiddlewareSocketEnd(config) {
        RED.nodes.createNode(this, config);
        // node-specific code goes here
        const node = this;

        node.on("input", (msg) => {
            if (!msg._socketId) {
                showNodeStatus(node, "red", "Missing _socketId in msg");
                node.error("No socket id found (2342)");
                return;
            }

            if (!msg._contextStorageName) {
                showNodeStatus(node, "red", "Missing _contextStorageName in msg");
                node.error("No context storage name found (2342)");
                return;
            }

            if (!msg._socketNext) {
                showNodeStatus(node, "red", "Missing _socketNext in msg");
                node.error("No socket next found (3324)");
                return;
            }


            if (msg.payload) {
                showNodeStatus(node, "green", "Allowed topic");
                node.send(msg);
                msg._socketNext();
                return;
            }

            // Socket cannot throw error in next() function, so we need to emit an event to handle it
            try {
                const socket = node.context().global.get(`socket_${msg._socketId}`, msg._contextStorageName);
                if (!socket) {
                    showNodeStatus(node, "red", `Socket not found with id ${msg._socketId}`);
                    node.error("No socket found with id " + msg._socketId);
                    return;
                }
                showNodeStatus(node, "red", "Not allowed topic");
                socket.emit("error", msg.errMsg ? msg.errMsg : 'Your action is not allowed (345456)');
                return;
            } catch (error) {
                showNodeStatus(node, "red", "Error");
                node.error(error);
            }
        });

    }

    RED.nodes.registerType("socket.io middleware-socket-end", socketIoMiddlewareSocketEnd);
};
