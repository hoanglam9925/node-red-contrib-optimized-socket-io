const { showNodeStatus } = require("./util/nodeStatus");
const parseTypedInputs = require("./util/parseTypedInputs");

module.exports = function (RED) {
  function NodeFunction(config) {
    // *************************************************************************
    // Setup
    // *************************************************************************
    RED.nodes.createNode(this, config);
    const node = this;

    // Node inputs
    node.inServer = RED.nodes.getNode(config.server);
    node.inRoom = config.room;
    node.inRoomType = config.roomType;
    node.inTarget = config.target;
    node.inTargetType = config.targetType;

    // *************************************************************************
    // Node logic
    // *************************************************************************
    // Called when a message is passed into the node
    const inputHandler = (msg, send, done) => {
      const io = node.inServer.io;

      const room = parseTypedInputs(node.inRoom, node.inRoomType, msg, RED);
      const target = parseTypedInputs(node.inTarget, node.inTargetType, msg, RED);

      let socket = io.sockets.sockets.get(target);
      if (!socket && msg._contextStorageName && msg._socketId) { 
        socket = node.context().global.get(`socket_${target}`, msg._contextStorageName);
      }

      // Sanity check socket
      if (!socket) {
        showNodeStatus(node, "red", `No socket found with id ${target}`);
      }

      try {
        socket.join(room);
        if (Array.isArray(room)) {
          const roomLength = room.length;
          showNodeStatus(node, "green", `Joined ${roomLength} rooms`);
        } else {
          showNodeStatus(node, "green", `Joined room ${room}`);
        }
      } catch (error) {
        showNodeStatus(node, "red", `Error joining room ${room}`);
      }

      node.send(msg);
    };

    // *************************************************************************
    // Listener management
    // *************************************************************************
    node.on("input", inputHandler);
  }

  RED.nodes.registerType("socket.io join", NodeFunction);
};
