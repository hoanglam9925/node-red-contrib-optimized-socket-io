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
        // Middleware
        serverIo.use((socket, next) => {
            // Log the connection
            const socketId = socket.id;
            // Set socket to global context
            node.context().global.set(`socket_${socketId}`, socket);
            node.send([{ socketId, next }, { socketId, next }]);
            next();
        });


    }

    RED.nodes.registerType("socket.io middleware-start", socketIoMiddlewareStart);
};
