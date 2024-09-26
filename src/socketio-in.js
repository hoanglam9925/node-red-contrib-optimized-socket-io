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
    // const sioEvent = `sio_event__${node.inEvent}`;
    const sioEvent = `${node.inEvent}`;

    // *************************************************************************
    // Node logic
    // *************************************************************************
    // Called when a socket.io message is received from a client
    node.on("input", (msg) => {
      if (!msg.socketId) {
        node.log("No msg.socketId");
        return;
      }

      const socket = node.context().global.get(`socket_${msg.socketId}`);
      const sioEventHandler = (eventData) => {
        console.debug("sioEventHandler", eventData);
        node.send({ ...eventData });
      };
  
      // *************************************************************************
      // Listener management
      // *************************************************************************
      // Register handler
      socket.on(sioEvent, sioEventHandler);
  
      // Deregister handler
      node.on("close", function () {
        socket.off(sioEvent, sioEventHandler);
      });
    });
    // const sioEventHandler = (eventData) => {
    //   const { socketId, event, payload } = eventData;

    //   if (event === node.inEvent) {
    //     node.send({ socketId, event, payload });
    //   }
    // };

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
