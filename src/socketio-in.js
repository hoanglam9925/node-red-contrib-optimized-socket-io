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
      if (!msg._socketId) {
        node.log("No msg.socketId");
        return;
      }

      if (!msg._contextStorageName) {
        node.error("No context storage name found in msg._contextStorageName");
        return;
      }

      // Get socket from global context
      const socket = node.context().global.get(`socket_${msg._socketId}`, msg._contextStorageName);
      if (!socket) {
        node.error("No socket found with id: " + msg._socketId);
        return;
      }

      // *************************************************************************
      // Listener management
      // *************************************************************************
      // Register handler
      socket.on(sioEvent, (eventData, ...args) => {
        if (args?.length > 0) {
          node.send({ event: sioEvent, ...eventData, args, ...msg });
        } else {
          node.send({ event: sioEvent, ...eventData, ...msg});
        }
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
