const parseTypedInputs = require("./util/parseTypedInputs");

module.exports = function (RED) {
    function socketIoMiddlewareStart(config) {
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
        const serverIo = node.inServer.io;
        if (!serverIo) {
            node.error("IO server not found (95834). Check configuration.");
            return;
        }

        const storageName = node.inServer.contextStorageName;
        // Register middleware
        serverIo.use((socket, next) => {
            const socketId = socket.id;
            // Set socket to global context
            node.context().global.set(`socket_${socketId}`, socket, storageName);

            const returnObject = {
                _socketId: socketId,
                _contextStorageName: storageName,
            }

            const returnObjectWithNext = {
                ...returnObject,
                _next: next
            }
            node.send([returnObjectWithNext, returnObject]);
        });


    }

    RED.nodes.registerType("socket.io middleware-start", socketIoMiddlewareStart);
};
