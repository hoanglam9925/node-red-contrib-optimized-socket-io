function getTimeStatus() {
    let date = new Date();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let timestamp = date.getTime();
    if (hour < 10)      hour = "0" + hour;
    if (minute < 10)    minute = "0" + minute;

    return `${hour}:${minute}`;
}
function showNodeStatus(node, fillColor, fillString)
{
    const time = getTimeStatus();
    const statusString = time + " • " + fillString;
    node.status({fill: fillColor, shape: "dot", text: statusString});
}
module.exports = {
    showNodeStatus,
    getTimeStatus
};