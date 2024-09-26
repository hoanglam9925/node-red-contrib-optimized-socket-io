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
        // Register middleware
        serverIo.use((socket, next) => {
            const socketId = socket.id;
            // Set socket to global context
            node.context().global.set(`socket_${socketId}`, socket);

            node.send([{ socketId, next}, { socketId }]);
        });


    }

    RED.nodes.registerType("socket.io middleware-start", socketIoMiddlewareStart);
};
