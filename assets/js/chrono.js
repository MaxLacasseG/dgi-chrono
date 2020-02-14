const electron = require ('electron');
const {ipcRenderer} = electron;

class Chrono {
  constructor (window) {
    this.state = {
      window,
      duration: [60],
      currentDurationIndex: 0,
      time: 0,
      isCounting: false,
      timeEnded: false,
      timer: null,
      points: 0,
      maxPoints: 150,
      cycle: 1,
      soundIndex: 1,
    };

    //BINDS METHODS
    this.initialState = this.state;
    this.initCounter = this.initCounter.bind (this);
    this.resetCounter = this.resetCounter.bind (this);
    this.startCounter = this.startCounter.bind (this);
    this.stopCounter = this.stopCounter.bind (this);
    this.updateCounter = this.updateCounter.bind (this);
    this.setCycle = this.setCycle.bind (this);
  }

  initCounter () {
    this.state.time = this.state.duration[this.state.currentDurationIndex];
    this.setCycle (this.state.cycle);
    ipcRenderer.send ('chrono:init', this.state.time);
    ipcRenderer.send ('chrono:update-points', this.state.points);
  }
  setCycle (cycle) {
    this.state.cycle = cycle;
    this.state.maxPoints = cycle === 1 ? 150 : 200;
    this.resetCounter ();
  }
  setSound (soundIndex) {
    this.state.soundIndex = soundIndex;
  }

  resetCounter () {
    this.stopCounter ();
    this.state.time = this.state.duration[this.state.currentDurationIndex];
    this.state.isCounting = false;
    this.state.timeEnded = false;
    this.state.points = 0;

    ipcRenderer.send (
      'chrono:reset',
      this.state.duration[this.state.currentDurationIndex]
    );
    ipcRenderer.send ('chrono:update-points', 0);
  }

  startCounter () {
    if (!this.state.isCounting) {
      if (this.state.timeEnded) {
        this.resetCounter ();
      }
      this.state.isCounting = true;
      this.state.timer = setInterval (this.updateCounter, 1000);
    }
  }

  stopCounter () {
    if (this.state.timer !== null) {
      clearInterval (this.state.timer);
      this.state.isCounting = false;
      this.state.timer = null;
    }
  }
  timeEnded () {
    this.state.timeEnded = true;
    this.stopCounter ();
    ipcRenderer.send ('chrono:time-ended');
  }

  updateCounter () {
    this.state.time--;
    if (this.state.time <= 0) {
      this.timeEnded ();
    } else {
      ipcRenderer.send ('chrono:update', this.state.time);
    }
  }

  addPoints (points) {
    if (!this.state.isCounting) return;
    if (this.state.timeEnded) return;

    this.state.points += points;
    if (this.state.points >= this.state.maxPoints) {
      ipcRenderer.send ('chrono:update-points', this.state.points);
      this.timeEnded ();
    } else {
      ipcRenderer.send ('chrono:update-points', this.state.points);
    }
  }
}

module.exports = new Chrono ();
