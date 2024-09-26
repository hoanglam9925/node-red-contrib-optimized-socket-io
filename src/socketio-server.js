const socketio = require("socket.io");
var BuiltInEmitter = require('events').EventEmitter

// const wildcard = require("socketio-wildcard");
function socketioWildcardMiddleware() {
  var Emitter = BuiltInEmitter
  var emit = Emitter.prototype.emit

  function onevent (oldOnevent, packet) {
    var args = packet.data || []
    if (packet.id != null) {
      args.push(this.ack(packet.id))
    }
    oldOnevent.call(this, packet);
    emit.call(this, '*', packet)
    return emit.apply(this, args)
  }

  return function (socket, next) {
    let oldOnevent = socket.onevent;
    var fn = onevent.bind(socket, oldOnevent)
    if (socket.onevent !== fn) {
      socket.onevent = fn
      socket.hasReplaceOneventFn = true;
    }
    return next ? next() : null
  }
}

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

      // socket.on("*", (packet) => {
      //   console.debug('llllllllll', packet);
      //   const [event, payload] = packet.data;
      //   node.emit(`sio_event__${event}`, { event, payload, socketId });
      // });

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
