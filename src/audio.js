// =================================================================================================
// Slate.js | Audio
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


M.audio = {
    files: {},
    playing: null,
    load: function(src, id) {
        M.audio.files[id] = new Audio(src);
        M.audio.files[id].load();
        M.audio.files[id].addEventListener('timeupdate', function() {
            if (M.audio.playing) M.audio.playing.update();
        });
        return M.audio.files[id];
    }
};

M.audio.Chunk = M.Class.extend({

    init: function(file, times) {
        if (M.isString(times)) times = M.map(parseFloat, times.split('|'));
        this.times = times;
        this.currentTime = times[0];
        this.duration = times[1] - times[0];
        this.player = M.audio.files[file] || M.audio.load(file, Math.floor(Math.random()*10000));
        this.ended = false;
    },

    play: function() {
        var _this = this;

        if (this.player.readyState < 2) {
            $(this.player).one('canplay seeked', function() { _this.play(); });
            return;
        }

        if (M.audio.playing) M.audio.playing.pause();
        M.audio.playing = this;

        this.ended = false;
        this.player.currentTime = this.currentTime;
        this.player.play();
        this.trigger('play', { p: (this.currentTime - this.times[0]) / this.duration, t: this.currentTime });
    },

    pause: function() {
        if (M.audio.playing === this) this.player.pause();
        this.trigger('pause');
    },

    setTime: function(time) {
        if (this.player.readyState) this.player.currentTime = time;
        this.trigger('timeupdate', { p: (time - this.times[0]) / this.duration, t: time });
    },

    reset: function() {
        if (M.audio.playing === this) this.player.pause();
        if (this.player.readyState) this.currentTime = this.times[0];
        this.ended = true;
        this.trigger('reset');
    },

    update: function() {
        if (this.ended) return;

        if (M.audio.playing === this)
            this.currentTime = this.player.currentTime;

        if (this.currentTime >= this.times[1]) {
            this.ended = true;
            this.pause();
            this.trigger('end');
            return;
        }

        this.trigger('timeupdate', { p: (this.currentTime - this.times[0]) / this.duration, t: this.currentTime });
    }

});

// =================================================================================================

M.speechRecognition = function() {

    if (!M.browser.speechRecognition) {
        return {
            start: function() { rec.start(); },
            stop: function() { rec.stop(); },
            addCommand: function(){},
            removeCommand: function(){},
            available: false
        };
    }

    var rec = new window.webkitSpeechRecognition();
    rec.continuous = true;
    rec.language = 'en-US';
    //rec.interimResults = true;

    var commands = {};

    var processCommand = function(name) {
        name = name.toLowerCase().trim();
        if (commands[name]) commands[name]();
    };

    rec.onresult = function(event) {
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            console.debug('Voice Input: ', event.results[i][0].transcript);
            processCommand(event.results[i][0].transcript);
        }
    };

    //rec.onstart = function() { ... }
    //rec.onerror = function(event) { ... }
    //rec.onend = function() { ... }

    var addCommand = function(name, fn) {
        if (!(name instanceof Array)) name = [name];
        for (var i=0; i<name.length; ++i) commands[name[i].toLowerCase()] = fn;
    };

    var removeCommand = function(name) {
        if (!(name instanceof Array)) name = [name];
        for (var i=0; i<name.length; ++i) commands[name[i].toLowerCase()] = undefined;
    };

    return {
        start: function() { rec.start(); },
        stop: function() { rec.stop(); },
        addCommand: addCommand,
        removeCommand: removeCommand,
        available: true
    };
};
