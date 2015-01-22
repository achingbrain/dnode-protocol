var shortId = require('shortid');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var DEFAULT_TIMEOUT = 30000;
var DEFAULT_WRAP_FN = function(cb) {return cb};
var DEFAULT_UNWRAP_FN = DEFAULT_WRAP_FN;

module.exports = function (options) {
    return new Callbacks(options);
};

function Callbacks (options) {
    EventEmitter.call(this)

    options = options || {}
    
    this.callbacks = {};
    this.wrap = options.wrap || DEFAULT_WRAP_FN;
    this.unwrap = options.unwrap || DEFAULT_UNWRAP_FN;
    this.timeout = options.timeout === undefined ? DEFAULT_TIMEOUT : options.timeout;
    
    var self = this;
    
    if(this.timeout > 0) {
        var interval = setInterval(function purgeTimedOutCallbacks() {
            var cutoff = Date.now() - self.timeout;
            
            for(var key in self.callbacks) {
                var wrapper = self.callbacks[key];

                if(wrapper.added == 0) {
                    continue;
                }
                
                if(wrapper && wrapper.added < cutoff) {
                    self.remove(key);
                }
            }
        }, this.timeout);

        if(interval && interval.unref) {
            interval.unref();
        }
    }
};
util.inherits(Callbacks, EventEmitter);

Callbacks.prototype.add = function (cb, forever) {
    var id = shortId.generate();

    // store the wrapper by id and callback to quickly look up duplicates
    this.callbacks[id] = {
        added: forever ? 0 : Date.now(),
        callback: this.wrap(cb, id),
        id: id
    };

    return id;
};

Callbacks.prototype.find = function (id) {
    var wrapper = this.callbacks[id];
    
    if(!wrapper || !wrapper.callback) {
        return undefined;
    }

    return this.unwrap(wrapper.callback, id);
};

Callbacks.prototype.remove = function (id) {
    delete this.callbacks[id];

    this.emit('remove', id)
};
