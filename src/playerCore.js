var playerCore = function (id, src, volume, end) {
  var self = this;
  this.id = id;
  this.src = src;
  this.onend = end;
  this.volume = volume;
  this.sync = function () {
    var play = document.getElementById(self.id);
    play.src = self.src;
    play.volume = self.volume;
    play.addEventListener('ended', function () {
      console.log('123', 123);
      self.onend();
    });
    return play;
  };
  var player = self.sync();

  /**
   * if curAudio is paused returns play, else load src and play
   * @returns {boolean}
   */
  this.play = function () {
    if (player.paused) {
      player.play();
      return false;
    }
    player.load();
    player.play();
  };

  /**
   * pause curAudio
   */

  this.pause = function () {
    player.pause();
  };

  /**
   * returns current position audio
   * @returns {Number|*|number}
   */
  this.position = function () {
    return player.currentTime;
  };

  /**
   * returns current duration audio
   * @returns {*}
   */
  this.duration = function () {
    return player.duration;
  };

  /**
   * Sets or unset loop at current audio
   * @param type
   */
  this.loop = function (type) {
    player.loop = type;
  };

  /**
   * Sets or unset mute at current audio
   * @param type
   */
  this.mute = function (type) {
    if (type === '') {
      return player.muted;
    }
    player.muted = type;
  };

  /**
   * Sets or gets current volume
   * @param volume
   */
  this.volume = function (volume) {
    var volumeCur = String(volume);
    if (volumeCur === '') {
      return self.volume;
    }
    player.volume = volumeCur;
  };
};

