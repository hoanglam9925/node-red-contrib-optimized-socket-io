const socketio = require("socket.io");

module.exports = function (RED) {
  function NodeFunction(config) {
    // *************************************************************************
    // Boilerplate
    // *************************************************************************
    RED.nodes.createNode(this, config);
    const node = this;

    // *************************************************************************
    // Setup
    // *************************************************************************
    node.inPort = config.port;
    try {
      node.options = config.options ? JSON.parse(config.options) : {};
    } catch (error) {
        node.error("[Wrong Options] create socket.io instance fail!");
        node.options = {};
    }

    // *************************************************************************
    // Create server
    // *************************************************************************
    const io = new socketio.Server(node.options);
    // io.use(socketioWildcardMiddleware());
    node.io = io;

    // *************************************************************************
    // Set up sockets
    // *************************************************************************
    io.on("connection", (socket) => {
      const socketId = socket.id;

      node.log(`${socketId} connected`);

      socket.on("disconnect", () => {
        node.log(`${socketId} disconnected`);
      });
    });

    // *************************************************************************
    // Handle disconnect
    // *************************************************************************
    node.on("close", function () {
      node.log("Closing");
      io.close();
    });

    // *************************************************************************
    // Start server
    // *************************************************************************
    io.listen(node.inPort);
    node.log(`Server listening on port ${node.inPort}`);
  }
  RED.nodes.registerType("socket.io server", NodeFunction);
};
