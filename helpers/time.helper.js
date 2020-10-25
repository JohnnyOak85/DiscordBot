const moment = require('moment');

function getDate() {
    return moment().format('Do MMMM YYYY, h:mm:ss a');
}

function addTime(amount, type) {
    return moment().add(amount, type).format();
}

function timerExpired(time) {
    if (moment(time).isBefore(moment().format())) return true;
}

module.exports = {
    getDate: getDate,
    addTime: addTime,
    timerExpired: timerExpired,
}