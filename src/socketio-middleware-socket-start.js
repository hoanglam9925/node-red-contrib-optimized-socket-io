const parseTypedInputs = require("./util/parseTypedInputs");

module.exports = function (RED) {
    function socketIoMiddlewareSocketStart(config) {
        // *************************************************************************
        // Setup
        // *************************************************************************
        RED.nodes.createNode(this, config);
        const node = this;

        // Node inputs
        node.name = config.name;

        // *************************************************************************
        // Node logic
        // *************************************************************************
        node.on("input", (msg) => {
            if (!msg._socketId) {
                node.log("No socket id found (56776)");
                return;
            }

            const storageName = msg._contextStorageName;
            if (!storageName) {
                node.error("No storage name found in msg._contextStorageName");
                return;
            }

            const socket = node.context().global.get(`socket_${msg._socketId}`, storageName);
            if (!socket) {
                node.error("No socket found with id " + msg._socketId);
                return;
            }

            socket.use((request, next) => {
                // Packet is the data sent from the client
                // next is the callback to continue the execution
                node.send({ request, _socketNext: next , ...msg});
            });

            socket.on("disconnect", () => {
                node.context().global.set(`socket_${msg._socketId}`, null, storageName);
            });
        });
        

    }

    RED.nodes.registerType("socket.io middleware-socket-start", socketIoMiddlewareSocketStart);
};

