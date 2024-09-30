const parseTypedInputs = require("./util/parseTypedInputs");

module.exports = function (RED) {
    function socketIoMiddlewareEnd(config) {
        RED.nodes.createNode(this, config);
        // node-specific code goes here
        const node = this;

        node.on("input", (msg) => {
            if (!msg._next) {
                node.log("No next function found (56756)");
                return;
            }

            if (msg.payload) {
                msg._next();
                return;
            }
            msg._next(new Error(msg.errMsg ? msg.errMsg : 'Your connection is not allowed (345456)'));
        });

    }

    RED.nodes.registerType("socket.io middleware-end", socketIoMiddlewareEnd);
};
