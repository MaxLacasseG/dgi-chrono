const electron = require("electron");
const {ipcRenderer} = electron;

class Chrono {
	constructor(window) {
		this.state = {
			window,
			duration: [45, 30],
			currentDurationIndex: 0,
			time: 0,
			isCounting: false,
			timeEnded: false,
			timer: null,
		};

		//BINDS METHODS
		this.initialState = this.state;
		this.initCounter = this.initCounter.bind(this);
		this.resetCounter = this.resetCounter.bind(this);
		this.startCounter = this.startCounter.bind(this);
		this.stopCounter = this.stopCounter.bind(this);
		this.updateCounter = this.updateCounter.bind(this);
		this.setDurationIndex = this.setDurationIndex.bind(this);
	}

	initCounter() {
		this.state.time = this.state.duration[this.state.currentDurationIndex];
		ipcRenderer.send("chrono:init", this.state.time);
	}
	setDurationIndex(index) {
		this.state.currentDurationIndex = index;
		this.resetCounter();
	}

	resetCounter() {
		this.stopCounter();
		this.state.time = this.state.duration[this.state.currentDurationIndex];
		this.state.isCounting = false;
		this.state.timeEnded = false;
		ipcRenderer.send("chrono:reset", this.state.time);
	}

	startCounter() {
		if (!this.state.isCounting) {
			if (this.state.timeEnded) {
				this.resetCounter();
			}
			this.state.isCounting = true;
			this.state.timer = setInterval(this.updateCounter, 1000);
		}
	}

	stopCounter() {
		if (this.state.timer !== null) {
			clearInterval(this.state.timer);
			this.state.isCounting = false;
			this.state.timer = null;
		}
	}
	timeEnded() {
		this.state.timeEnded = true;
		this.stopCounter();
		ipcRenderer.send("chrono:time-ended");
	}

	updateCounter() {
		this.state.time--;
		if (this.state.time <= 0) {
			this.timeEnded();
		} else {
			ipcRenderer.send("chrono:update", this.state.time);
		}
	}
}

module.exports = new Chrono();
