export default class Sound {
  constructor() {
    this.sounds = [
      // 221059453,
      149151253
    ];
    this.currentSoundIndex = 221059453;
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();

    // 0に近いほど描画頻度が高くなる
    this.analyser.smoothingTimeConstant = 0.5;

    this.analyser.fftSize = 32;

    // 周波数単位の値を入れる配列(fftの1/2の値)
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  _loadSoundBuffer() {
    return new Promise((resolve, reject) => {
      this._requestFile((response) => {
        this._decodeSoundData(response, (buffer) => {
          resolve(buffer);
        });
      });
    });
  }

  _decodeSoundData(soundFile, cb) {
    this.audioCtx.decodeAudioData(soundFile,
      (buffer) => {
        if (!buffer) {
          alert('error decoding file data: ' + this.currentSoundIndex);
          return;
        }
        cb(buffer);
      },
      (error) => {
        this.currentSoundIndex++;
        this.play();
      }
    );
  }

  _requestFile(cb) {
    const _xhr = new XMLHttpRequest();
    // _xhr.open("GET", 'http://api.soundcloud.com/tracks/' + this.sounds[this.currentSoundIndex] + '/stream?client_id=70071b9c113c7ff59200f977983b880a', true);
    _xhr.open("GET", 'http://api.soundcloud.com/tracks/' + this.currentSoundIndex + '/stream?client_id=70071b9c113c7ff59200f977983b880a', true);
    _xhr.responseType = "arraybuffer";
    _xhr.onload = () => {
      cb(_xhr.response);
    };
    _xhr.send();
  }

  play() {
    console.log(this.currentSoundIndex);
    this._loadSoundBuffer(this.currentSound).then((buffer) => {
      const source = this.audioCtx.createBufferSource();
      source.onended = () => {
        console.log('ended');
        if(this.sounds.length === this.currentSoundIndex + 1) {
          this.currentSoundIndex = 0;
        } else{
          this.currentSoundIndex++;
        }
        this.play();
      };
      source.buffer = buffer;
      setTimeout(() => {
        source.stop();
      }, source.buffer.duration / source.playbackRate.value * 1000);
      source.connect(this.audioCtx.destination);
      source.connect(this.analyser);
      source.start();
    });
  }

  getSoundData() {
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }
}
