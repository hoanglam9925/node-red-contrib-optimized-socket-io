const parseTypedInputs = require("./util/parseTypedInputs");

module.exports = function (RED) {
    function socketIoMiddlewareEnd(config) {
        RED.nodes.createNode(this, config);
        // node-specific code goes here
        const node = this;

        node.on("input", (msg) => {
            if (!msg.next) {
                node.log("No msg.next");
                return;
            }

            if (msg.payload) {
                msg.next();
                return;
            }
            msg.next(new Error(msg.errMsg ? msg.errMsg : 'Your connection is not allowed (345456)'));
        });

    }

    RED.nodes.registerType("socket.io middleware-end", socketIoMiddlewareEnd);
};
