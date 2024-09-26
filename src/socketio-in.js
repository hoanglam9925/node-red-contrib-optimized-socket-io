module.exports = function (RED) {
  function NodeFunction(config) {
    // *************************************************************************
    // Setup
    // *************************************************************************
    RED.nodes.createNode(this, config);
    const node = this;

    // Node inputs
    node.inServer = RED.nodes.getNode(config.server);
    node.inEvent = config.event;

    // Config node event name
    const sioEvent = `${node.inEvent}`;

    // *************************************************************************
    // Node logic
    // *************************************************************************
    // Called when a socket.io message is received from a client
    // *************** NO NEED TO GET SERVER, GET SOCKET FROM GLOBAL CONTEXT ***************
    node.on("input", (msg) => {
      if (!msg.socketId) {
        node.log("No msg.socketId");
        return;
      }

      // Get socket from global context
      const socket = node.context().global.get(`socket_${msg.socketId}`);
      if (!socket) {
        node.error("No socket found with id: " + msg.socketId);
        return;
      }

      // *************************************************************************
      // Listener management
      // *************************************************************************
      // Register handler
      socket.on(sioEvent, (eventData) => {
        node.send({ ...eventData });
      });
  
      // Deregister handler
      node.on("close", function () {
        socket.off(sioEvent, sioEventHandler);
      });
    });

    // // *************************************************************************
    // // Listener management
    // // *************************************************************************
    // // Register handler
    // node.inServer.on(sioEvent, sioEventHandler);

    // // Deregister handler
    node.on("close", function () {
      node.inServer.off(sioEvent, sioEventHandler);
    });
  }

  RED.nodes.registerType("socket.io in", NodeFunction);
};
