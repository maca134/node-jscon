module.exports = ResponseBuffer;

function ResponseBuffer(buffer) {
    if (!(buffer instanceof Buffer))
        throw 'buffer is not a Buffer';
    this.buffer = buffer;
    this.ptr = 0;
}

ResponseBuffer.prototype.getByte = function () {
    var d = this.buffer[this.ptr];
    this.ptr++;
    return d;
};

ResponseBuffer.prototype.getShort = function () {
    var d = this.buffer.readUIntLE(this.ptr, 2);
    this.ptr++;
    this.ptr++;
    return d;
};

ResponseBuffer.prototype.getUnsignedLong = function () {
    var d = this.buffer.readUIntLE(this.ptr, 4);
    this.ptr++;
    this.ptr++;
    this.ptr++;
    this.ptr++;
    return d;
};

ResponseBuffer.prototype.getInt = function () {
    var d = this.buffer.readInt32LE(this.ptr, 4);
    this.ptr++;
    this.ptr++;
    this.ptr++;
    this.ptr++;
    return d;
};

ResponseBuffer.prototype.getString = function () {
    var str = '';
    do {
        var c = this.buffer[this.ptr];
        this.ptr++;
        if (c != 0)
            str += String.fromCharCode(c);
    } while (c != 0);
    return str;
};

ResponseBuffer.prototype.move = function (i) {
    this.ptr += i;
};

ResponseBuffer.prototype.remaining = function (i) {
    return this.buffer.length - this.ptr;
};