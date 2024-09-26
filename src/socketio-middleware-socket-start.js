const parseTypedInputs = require("./util/parseTypedInputs");
const wildcard = require("socketio-wildcard");

module.exports = function (RED) {
    function socketIoMiddlewareSocketStart(config) {
        // *************************************************************************
        // Setup
        // *************************************************************************
        RED.nodes.createNode(this, config);
        const node = this;

        // Node inputs
        node.name = config.name;
        node.inServer = RED.nodes.getNode(config.server);

        // *************************************************************************
        // Node logic
        // *************************************************************************
        node.on("input", (msg) => {
            if (!msg.socketId) {
                node.log("No msg.socketId");
                return;
            }

            const socket = node.context().global.get(`socket_${msg.socketId}`);
            if (!socket) {
                node.error("No socket");
                return;
            }
            // socket.use(wildcard());
            socket.use((request, next) => {
                console.debug("socket start");
                
                // Packet is the data sent from the client
                // next is the callback to continue the execution
                node.send({ request, socketNext: next , ...msg});
            });
        });
        

    }

    RED.nodes.registerType("socket.io middleware-socket-start", socketIoMiddlewareSocketStart);
};
