(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {
  'use strict';
  var rec = require('./recorder.js');
  var recorder, audioRecorder, checkAudioSupport, audioSupported, playbackSource, UNSUPPORTED = 'Audio is not supported.';

  /**
   * Represents an audio control that can start and stop recording,
   * export captured audio, play an audio buffer, and check if audio
   * is supported.
   */
  exports.audioControl = function (options) {
    options = options || {};
    this.checkAudioSupport = options.checkAudioSupport !== false;

    /**
     * This callback type is called `onSilenceCallback`.
     *
     * @callback onSilenceCallback
     */

    /**
     * Visualize callback: `visualizerCallback`.
     *
     * @callback visualizerCallback
     * @param {Uint8Array} dataArray
     * @param {number} bufferLength
     */

    /**
     * Clears the previous buffer and starts buffering audio.
     *
     * @param {?onSilenceCallback} onSilence - Called when silence is detected.
     * @param {?visualizerCallback} visualizer - Can be used to visualize the captured buffer.
     * @param {silenceDetectionConfig} - Specify custom silence detection values.
     * @throws {Error} If audio is not supported.
     */
    var startRecording = function (onSilence, visualizer, silenceDetectionConfig) {
      onSilence = onSilence || function () { /* no op */
        };
      visualizer = visualizer || function () { /* no op */
        };
      audioSupported = audioSupported !== false;
      if (!audioSupported) {
        throw new Error(UNSUPPORTED);
      }
      recorder = audioRecorder.createRecorder(silenceDetectionConfig);
      recorder.record(onSilence, visualizer);
    };

    /**
     * Stops buffering audio.
     *
     * @throws {Error} If audio is not supported.
     */
    var stopRecording = function () {
      audioSupported = audioSupported !== false;
      if (!audioSupported) {
        throw new Error(UNSUPPORTED);
      }
      recorder.stop();
    };

    /**
     * On export complete callback: `onExportComplete`.
     *
     * @callback onExportComplete
     * @param {Blob} blob The exported audio as a Blob.
     */

    /**
     * Exports the captured audio buffer.
     *
     * @param {onExportComplete} callback - Called when the export is complete.
     * @param {sampleRate} The sample rate to use in the export.
     * @throws {Error} If audio is not supported.
     */
    var exportWAV = function (callback, sampleRate) {
      audioSupported = audioSupported !== false;
      if (!audioSupported) {
        throw new Error(UNSUPPORTED);
      }
      if (!(callback && typeof callback === 'function')) {
        throw new Error('You must pass a callback function to export.');
      }
      sampleRate = (typeof sampleRate !== 'undefined') ? sampleRate : 16000;
      recorder.exportWAV(callback, sampleRate);
      recorder.clear();
    };

    /**
     * On playback complete callback: `onPlaybackComplete`.
     *
     * @callback onPlaybackComplete
     */

    /**
     * Plays the audio buffer with an HTML5 audio tag.
     * @param {Uint8Array} buffer - The audio buffer to play.
     * @param {?onPlaybackComplete} callback - Called when audio playback is complete.
     */
    var playHtmlAudioElement = function (buffer, callback) {
      if (typeof buffer === 'undefined') {
        return;
      }
      var myBlob = new Blob([buffer]);
      var audio = document.createElement('audio');
      var objectUrl = window.URL.createObjectURL(myBlob);
      audio.src = objectUrl;
      audio.addEventListener('ended', function () {
        audio.currentTime = 0;
        if (typeof callback === 'function') {
          callback();
        }
      });
      audio.play();
    };

    /**
     * On playback complete callback: `onPlaybackComplete`.
     *
     * @callback onPlaybackComplete
     */

    /**
     * Plays the audio buffer with a WebAudio AudioBufferSourceNode.
     * @param {Uint8Array} buffer - The audio buffer to play.
     * @param {?onPlaybackComplete} callback - Called when audio playback is complete.
     */
    var play = function (buffer, callback) {
      if (typeof buffer === 'undefined') {
        return;
      }
      var myBlob = new Blob([buffer]);
      // We'll use a FileReader to create and ArrayBuffer out of the audio response.
      var fileReader = new FileReader();
      fileReader.onload = function() {
        // Once we have an ArrayBuffer we can create our BufferSource and decode the result as an AudioBuffer.
        playbackSource = audioRecorder.audioContext().createBufferSource();
        audioRecorder.audioContext().decodeAudioData(this.result, function(buf) {
          // Set the source buffer as our new AudioBuffer.
          playbackSource.buffer = buf;
          // Set the destination (the actual audio-rendering device--your device's speakers).
          playbackSource.connect(audioRecorder.audioContext().destination);
          // Add an "on ended" callback.
          playbackSource.onended = function(event) {
            if (typeof callback === 'function') {
              callback();
            }
          };
          // Start the playback.
          playbackSource.start(0);
        });
      };
      fileReader.readAsArrayBuffer(myBlob);
    };

    /**
     * Stops the playback source (created by the play method) if it exists. The `onPlaybackComplete`
     * callback will be called.
     */
    var stop = function() {
      if (typeof playbackSource === 'undefined') {
        return;
      }
      playbackSource.stop();
    };

    /**
     * Clear the recording buffer.
     */
    var clear = function () {
      recorder.clear();
    };

    /**
     * On audio supported callback: `onAudioSupported`.
     *
     * @callback onAudioSupported
     * @param {boolean}
     */

    /**
     * Checks that getUserMedia is supported and the user has given us access to the mic.
     * @param {onAudioSupported} callback - Called with the result.
     */
    var supportsAudio = function (callback) {
      callback = callback || function () { /* no op */
        };
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        audioRecorder = rec.audioRecorder();
        audioRecorder.requestDevice()
          .then(function (stream) {
            audioSupported = true;
            callback(audioSupported);
          })
          .catch(function (error) {
            audioSupported = false;
            callback(audioSupported);
          });
      } else {
        audioSupported = false;
        callback(audioSupported);
      }
    };

    if (this.checkAudioSupport) {
      supportsAudio();
    }

    return {
      startRecording: startRecording,
      stopRecording: stopRecording,
      exportWAV: exportWAV,
      play: play,
      stop: stop,
      clear: clear,
      playHtmlAudioElement: playHtmlAudioElement,
      supportsAudio: supportsAudio
    };
  };
})();

},{"./recorder.js":5}],2:[function(require,module,exports){
(function() {
  'use strict';
  var AudioControl = require('./control.js').audioControl;

  var DEFAULT_LATEST = '$LATEST';
  var DEFAULT_CONTENT_TYPE = 'audio/x-l16; sample-rate=16000';
  var DEFAULT_USER_ID = 'userId';
  var DEFAULT_ACCEPT_HEADER_VALUE = 'audio/mpeg';
  var MESSAGES = Object.freeze({
    PASSIVE: 'Passive',
    LISTENING: 'Listening',
    SENDING: 'Sending',
    SPEAKING: 'Speaking'
  });

  var lexruntime, audioControl = new AudioControl({ checkAudioSupport: false });

  exports.conversation = function(config, onStateChange, onSuccess, onError, onAudioData) {
    var currentState;

    // Apply default values.
    this.config = applyDefaults(config);
    this.lexConfig = this.config.lexConfig;
    this.messages = MESSAGES;
    onStateChange = onStateChange || function() { /* no op */ };
    this.onSuccess = onSuccess || function() { /* no op */ };
    this.onError = onError || function() { /* no op */ };
    this.onAudioData = onAudioData || function() { /* no op */ };

    // Validate input.
    if (!this.config.lexConfig.botName) {
      this.onError('A Bot name must be provided.');
      return;
    }
    if (!AWS.config.credentials) {
      this.onError('AWS Credentials must be provided.');
      return;
    }
    if (!AWS.config.region) {
      this.onError('A Region value must be provided.');
      return;
    }

    lexruntime = new AWS.LexRuntime();

    this.onSilence = function() {
      if (config.silenceDetection) {
        audioControl.stopRecording();
        currentState.advanceConversation();
      }
    };

    this.transition = function(conversation) {
      currentState = conversation;
      var state = currentState.state;
      onStateChange(state.message);

      // If we are transitioning into SENDING or SPEAKING we want to immediately advance the conversation state
      // to start the service call or playback.
      if (state.message === state.messages.SENDING || state.message === state.messages.SPEAKING) {
        currentState.advanceConversation();
      }
      // If we are transitioning in to sending and we are not detecting silence (this was a manual state change)
      // we need to do some cleanup: stop recording, and stop rendering.
      if (state.message === state.messages.SENDING && !this.config.silenceDetection) {
        audioControl.stopRecording();
      }
    };

    this.advanceConversation = function() {
      audioControl.supportsAudio(function(supported) {
        if (supported) {
          currentState.advanceConversation();
        } else {
          onError('Audio is not supported.');
        }
      });
    };

    this.updateConfig = function(newValue) {
      this.config = applyDefaults(newValue);
      this.lexConfig = this.config.lexConfig;
    };

    this.reset = function() {
      audioControl.clear();
      currentState = new Initial(currentState.state);
    };

    currentState = new Initial(this);

    return {
      advanceConversation: this.advanceConversation,
      updateConfig: this.updateConfig,
      reset: this.reset
    };
  };

  var Initial = function(state) {
    this.state = state;
    state.message = state.messages.PASSIVE;
    this.advanceConversation = function() {
      audioControl.startRecording(state.onSilence, state.onAudioData, state.config.silenceDetectionConfig);
      state.transition(new Listening(state));
    };
  };

  var Listening = function(state) {
    this.state = state;
    state.message = state.messages.LISTENING;
    this.advanceConversation = function() {
      audioControl.exportWAV(function(blob) {
        state.audioInput = blob;
        state.transition(new Sending(state));
      });
    };
  };

  var Sending = function(state) {
    this.state = state;
    state.message = state.messages.SENDING;
    this.advanceConversation = function() {
      state.lexConfig.inputStream = state.audioInput;
      lexruntime.postContent(state.lexConfig, function(err, data) {
        if (err) {
          state.onError(err);
          state.transition(new Initial(state));
        } else {
          state.audioOutput = data;
          state.transition(new Speaking(state));
          state.onSuccess(data);
        }
      });
    };
  };

  var Speaking = function(state) {
    this.state = state;
    state.message = state.messages.SPEAKING;
    this.advanceConversation = function() {
      if (state.audioOutput.contentType === 'audio/mpeg') {
        audioControl.play(state.audioOutput.audioStream, function() {
          if (state.audioOutput.dialogState === 'ReadyForFulfillment' ||
            state.audioOutput.dialogState === 'Fulfilled' ||
            state.audioOutput.dialogState === 'Failed' ||
            !state.config.silenceDetection) {
            state.transition(new Initial(state));
          } else {
            audioControl.startRecording(state.onSilence, state.onAudioData, state.config.silenceDetectionConfig);
            state.transition(new Listening(state));
          }
        });
      } else {
        state.transition(new Initial(state));
      }
    };
  };

  var applyDefaults = function(config) {
    config = config || {};
    config.silenceDetection = config.hasOwnProperty('silenceDetection') ? config.silenceDetection : true;

    var lexConfig = config.lexConfig || {};
    lexConfig.botAlias = lexConfig.hasOwnProperty('botAlias') ? lexConfig.botAlias : DEFAULT_LATEST;
    lexConfig.botName = lexConfig.hasOwnProperty('botName') ? lexConfig.botName : '';
    lexConfig.contentType = lexConfig.hasOwnProperty('contentType') ? lexConfig.contentType : DEFAULT_CONTENT_TYPE;
    lexConfig.userId = lexConfig.hasOwnProperty('userId') ? lexConfig.userId : DEFAULT_USER_ID;
    lexConfig.accept = lexConfig.hasOwnProperty('accept') ? lexConfig.accept : DEFAULT_ACCEPT_HEADER_VALUE;
    config.lexConfig = lexConfig;

    return config;
  };

})();

},{"./control.js":1}],3:[function(require,module,exports){
(function (global){
/**
 * @module LexAudio
 * @description The global namespace for Amazon Lex Audio
 */
global.LexAudio = global.LexAudio || {};
global.LexAudio.audioControl = require('./control.js').audioControl;
global.LexAudio.conversation = require('./conversation.js').conversation;
module.exports = global.LexAudio;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./control.js":1,"./conversation.js":2}],4:[function(require,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn, options) {
    var wkey;
    var cacheKeys = Object.keys(cache);

    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        var exp = cache[key].exports;
        // Using babel as a transpiler to use esmodule, the export will always
        // be an object with the default export as a property of it. To ensure
        // the existing api and babel esmodule exports are both supported we
        // check for both
        if (exp === fn || exp && exp.default === fn) {
            wkey = key;
            break;
        }
    }

    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            Function(['require','module','exports'], '(' + fn + ')(self)'),
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);

    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        Function(['require'], (
            // try to call default if defined to also support babel esmodule
            // exports
            'var f = require(' + stringify(wkey) + ');' +
            '(f.default ? f.default : f)(self);'
        )),
        scache
    ];

    var workerSources = {};
    resolveSources(skey);

    function resolveSources(key) {
        workerSources[key] = true;

        for (var depPath in sources[key][1]) {
            var depKey = sources[key][1][depPath];
            if (!workerSources[depKey]) {
                resolveSources(depKey);
            }
        }
    }

    var src = '(' + bundleFn + ')({'
        + Object.keys(workerSources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;

    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    var blob = new Blob([src], { type: 'text/javascript' });
    if (options && options.bare) { return blob; }
    var workerUrl = URL.createObjectURL(blob);
    var worker = new Worker(workerUrl);
    worker.objectURL = workerUrl;
    return worker;
};

},{}],5:[function(require,module,exports){
 (function () {
  'use strict';
  var work = require('webworkify');
  var worker = work(require('./worker.js'));
  var audio_context, audio_stream;

  /**
   * The Recorder object. Sets up the onaudioprocess callback and communicates
   * with the web worker to perform audio actions.
   */
  var recorder = function (source, silenceDetectionConfig) {

    silenceDetectionConfig = silenceDetectionConfig || {};
    silenceDetectionConfig.time = silenceDetectionConfig.hasOwnProperty('time') ? silenceDetectionConfig.time : 1500;
    silenceDetectionConfig.amplitude = silenceDetectionConfig.hasOwnProperty('amplitude') ? silenceDetectionConfig.amplitude : 0.2;
    
    var recording = false,
      currCallback, start, silenceCallback, visualizationCallback;

    // Create a ScriptProcessorNode with a bufferSize of 4096 and a single input and output channel
    var node = source.context.createScriptProcessor(4096, 1, 1);

    worker.onmessage = function (message) {
      var blob = message.data;
      currCallback(blob);
    };

    worker.postMessage({
      command: 'init',
      config: {
        sampleRate: source.context.sampleRate,
      }
    });

    /**
     * Sets the silence and viz callbacks, resets the silence start time, and sets recording to true.
     * @param {?onSilenceCallback} onSilence - Called when silence is detected.
     * @param {?visualizerCallback} visualizer - Can be used to visualize the captured buffer.
     */
    var record = function (onSilence, visualizer) {
      silenceCallback = onSilence;
      visualizationCallback = visualizer;
      start = Date.now();
      recording = true;
    };

    /**
     * Sets recording to false.
     */
    var stop = function () {
      recording = false;
    };

    /**
     * Posts "clear" message to the worker.
     */
    var clear = function () {
      stop();
      worker.postMessage({command: 'clear'});
    };

    /**
     * Sets the export callback and posts an "export" message to the worker.
     * @param {onExportComplete} callback - Called when the export is complete.
     * @param {sampleRate} The sample rate to use in the export.
     */
    var exportWAV = function (callback, sampleRate) {
      currCallback = callback;
      worker.postMessage({
        command: 'export',
        sampleRate: sampleRate
      });
    };

    /**
     * Checks the time domain data to see if the amplitude of the audio waveform is more than
     * the silence threshold. If it is, "noise" has been detected and it resets the start time.
     * If the elapsed time reaches the time threshold the silence callback is called. If there is a 
     * visualizationCallback it invokes the visualization callback with the time domain data.
     */
    var analyse = function () {
      analyser.fftSize = 2048;
      var bufferLength = analyser.fftSize;
      var dataArray = new Uint8Array(bufferLength);
      var amplitude = silenceDetectionConfig.amplitude;
      var time = silenceDetectionConfig.time;

      analyser.getByteTimeDomainData(dataArray);

      if (typeof visualizationCallback === 'function') {
        visualizationCallback(dataArray, bufferLength);
      }

      for (var i = 0; i < bufferLength; i++) {
        // Normalize between -1 and 1.
        var curr_value_time = (dataArray[i] / 128) - 1.0;
        if (curr_value_time > amplitude || curr_value_time < (-1 * amplitude)) {
          start = Date.now();
        }
      }
      var newtime = Date.now();
      var elapsedTime = newtime - start;
      if (elapsedTime > time) {
        silenceCallback();
      }
    };

    /**
     * The onaudioprocess event handler of the ScriptProcessorNode interface. It is the EventHandler to be
     * called for the audioprocess event that is dispatched to ScriptProcessorNode node types.
     * @param {AudioProcessingEvent} audioProcessingEvent - The audio processing event.
     */
    node.onaudioprocess = function (audioProcessingEvent) {
      if (!recording) {
        return;
      }
      worker.postMessage({
        command: 'record',
        buffer: [
          audioProcessingEvent.inputBuffer.getChannelData(0),
        ]
      });
      analyse();
    };

    var analyser = source.context.createAnalyser();
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;

    source.connect(analyser);
    analyser.connect(node);
    node.connect(source.context.destination);

    return {
      record: record,
      stop: stop,
      clear: clear,
      exportWAV: exportWAV
    };
  };

  /**
   * Audio recorder object. Handles setting up the audio context,
   * accessing the mike, and creating the Recorder object.
   */
  exports.audioRecorder = function () {

    /**
     * Creates an audio context and calls getUserMedia to request the mic (audio).
     */
    var requestDevice = function () {

      if (typeof audio_context === 'undefined') {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audio_context = new AudioContext();
      }

      return navigator.mediaDevices.getUserMedia({audio: true}).then(function (stream) {
        audio_stream = stream;
      });
    };

    var createRecorder = function (silenceDetectionConfig) {
      return recorder(audio_context.createMediaStreamSource(audio_stream), silenceDetectionConfig);
    };

    var audioContext = function () {
      return audio_context;
    };

    return {
      requestDevice: requestDevice,
      createRecorder: createRecorder,
      audioContext: audioContext
    };

  };
})();
},{"./worker.js":6,"webworkify":4}],6:[function(require,module,exports){
module.exports = function (self) {
  'use strict';
  var recLength = 0,
    recBuffer = [],
    recordSampleRate;

  self.addEventListener('message', function (e) {
    switch (e.data.command) {
      case 'init':
        init(e.data.config);
        break;
      case 'record':
        record(e.data.buffer);
        break;
      case 'export':
        exportBuffer(e.data.sampleRate);
        break;
      case 'clear':
        clear();
        break;
    }
  });

  function init(config) {
    recordSampleRate = config.sampleRate;
  }

  function record(inputBuffer) {
    recBuffer.push(inputBuffer[0]);
    recLength += inputBuffer[0].length;
  }

  function exportBuffer(exportSampleRate) {
    var mergedBuffers = mergeBuffers(recBuffer, recLength);
    var downsampledBuffer = downsampleBuffer(mergedBuffers, exportSampleRate);
    var encodedWav = encodeWAV(downsampledBuffer);
    var audioBlob = new Blob([encodedWav], {type: 'application/octet-stream'});
    postMessage(audioBlob);
  }

  function clear() {
    recLength = 0;
    recBuffer = [];
  }

  function downsampleBuffer(buffer, exportSampleRate) {
    if (exportSampleRate === recordSampleRate) {
      return buffer;
    }
    var sampleRateRatio = recordSampleRate / exportSampleRate;
    var newLength = Math.round(buffer.length / sampleRateRatio);
    var result = new Float32Array(newLength);
    var offsetResult = 0;
    var offsetBuffer = 0;
    while (offsetResult < result.length) {
      var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      var accum = 0,
        count = 0;
      for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = accum / count;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  function mergeBuffers(bufferArray, recLength) {
    var result = new Float32Array(recLength);
    var offset = 0;
    for (var i = 0; i < bufferArray.length; i++) {
      result.set(bufferArray[i], offset);
      offset += bufferArray[i].length;
    }
    return result;
  }

  function floatTo16BitPCM(output, offset, input) {
    for (var i = 0; i < input.length; i++, offset += 2) {
      var s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }

  function writeString(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  function encodeWAV(samples) {
    var buffer = new ArrayBuffer(44 + samples.length * 2);
    var view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 32 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, recordSampleRate, true);
    view.setUint32(28, recordSampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    floatTo16BitPCM(view, 44, samples);

    return view;
  }
};

},{}]},{},[3]);
