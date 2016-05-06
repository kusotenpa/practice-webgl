export default class Midi {
  constructor(cb) {
    // 各note番号
    this.knobType = 176;
    this.padType = 144;
    this.knob1 = [21, 22, 23, 24, 25, 26, 27, 28];
    this.knob2 = [41, 42, 43, 44, 45, 46, 47, 48];
    this.pad = [9, 10, 11, 12, 25, 26, 27, 28];

    // 点灯中のpadを保持する配列
    this.activePad = [];

    // send先のmidi
    this.outputs = [];

    this.cb = cb;

    navigator
      .requestMIDIAccess()
      .then((data) => {
        this._onMIDISuccess(data);
      }, this._errorCallback);
  }

  _errorCallback(err) {
      console.log(err);
  }

  _onMIDISuccess(midiAccess) {
    console.log("Success to get MIDI access");

    const midi = midiAccess;
    const inputs = [];

    // inputデバイスの配列を作成
    const inputIterator = midi.inputs.values();
    for(let o = inputIterator.next(); !o.done; o = inputIterator.next()) {
      inputs.push(o.value);
    }

    // outputデバイスの配列を作成
    var outputIterator = midi.outputs.values();
    for(let o = outputIterator.next(); !o.done; o = outputIterator.next()) {
      this.outputs.push(o.value);
    }

    // 0番目のMIDI機器から何か送られてきた時
    inputs[0].onmidimessage = (e) => {
      this._onMidimessage(e);
    };
  }

  _onMidimessage(e) {
    const isKnob = this.knobType === e.data[0] ? true : false;
    const isPad = this.padType === e.data[0] ? true : false;

    // ツマミと1~8のパッド以外 または 1~8のパッドを離した時は無視する
    if((!isKnob && !isPad) || isPad && e.data[2] === 0) return;

    let isKnob1 = false;
    let isKnob2 = false;
    let note;
    let velocity;

    if(isKnob) {
      let knob1Number = this.knob1.indexOf(e.data[1]) + 1;
      let knob2Number = this.knob2.indexOf(e.data[1]) + 1;
      isKnob1 = knob1Number ? true : false;
      isKnob2 = knob2Number ? true : false;
      note = Math.max(knob1Number, knob2Number);
      velocity = e.data[2];

    } else if(isPad) {
      note = this.pad.indexOf(e.data[1]) + 1;
      let activePadPosition = this.activePad.indexOf(note);

      // 既に点灯中のpadの時
      if(activePadPosition > -1) {
        // 消灯
        this.outputs[0].send([e.data[0], e.data[1], 0]);
        this.activePad.splice(activePadPosition, 1);
        velocity = 0;

      } else {
        note = this.pad.indexOf(e.data[1]) + 1;
        // 点灯 60 -> color: green, brightness: max
        this.outputs[0].send([e.data[0], e.data[1], 60]);
        this.activePad.push(note);
        velocity = 127;
      }

    }

    // 0~1に正規化
    velocity = velocity / 127;


    const data = {
      isKnob1,
      isKnob2,
      isPad,
      note,
      velocity
    };

    this.cb(data);

    // console.log('---------------');
    // console.log('knob or pad', e.data[0]); // knob or pad
    // console.log('note', e.data[1]); // position
    // console.log('velocity', e.data[2]); // velocity
  }
}