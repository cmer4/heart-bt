import { Component } from '@angular/core';
import { HeartRateService } from './heart-rate.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  statusText: string = 'Breathe...';
  heartRates: Array<any> = [];
  currentHeartRate: number = 120;
  canvas;
  mode: string = 'bar';

  constructor(
    public heartRate: HeartRateService
  ) {
    //this.initializeApp();
  }

  connectHeartRateSensor() {
    this.statusText = "Breathe...";
    this.heartRates = [];
    this.heartRate.connect()
    .then(() => this.heartRate.startNotificationsHeartRateMeasurement().then(this.handleHeartRateMeasurement))
    .catch(error => { this.statusText = error; });
  }

  initializeApp() {
    //this.connectHeartRateSensor();
  };

  handleHeartRateMeasurement = (heartRateMeasurement) => {
    heartRateMeasurement.addEventListener('characteristicvaluechanged', event => {
      let heartRateMeasurement = this.heartRate.parseHeartRate(event.target.value);
      this.statusText = heartRateMeasurement.heartRate + '❤';
      this.heartRates.push(heartRateMeasurement.heartRate);
      this.currentHeartRate = heartRateMeasurement.heartRate;
      this.drawWaves();
    });
    var winFeature = 'location=no,toolbar=no,menubar=no,scrollbars=no,resizable=yes';
    window.open('google.com','null',winFeature);
  }

  drawWaves() {
    requestAnimationFrame(() => {
      this.canvas.width = parseInt(getComputedStyle(this.canvas).width.slice(0, -2)) * devicePixelRatio;
      this.canvas.height = parseInt(getComputedStyle(this.canvas).height.slice(0, -2)) * devicePixelRatio;
  
      var context = this.canvas.getContext('2d');
      var margin = 2;
      var max = Math.max(0, Math.round(this.canvas.width / 11));
      var offset = Math.max(0, this.heartRates.length - max);
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      context.strokeStyle = '#00796B';
      if (this.mode === 'bar') {
        for (var i = 0; i < Math.max(this.heartRates.length, max); i++) {
          var barHeight = Math.round(this.heartRates[i + offset ] * this.canvas.height / 200);
          context.rect(11 * i + margin, this.canvas.height - barHeight, margin, Math.max(0, barHeight - margin));
          context.stroke();
        }
      } else if (this.mode === 'line') {
        context.beginPath();
        context.lineWidth = 6;
        context.lineJoin = 'round';
        context.shadowBlur = 1;
        context.shadowColor = '#333';
        context.shadowOffsetY = 1;
        for (var i = 0; i < Math.max(this.heartRates.length, max); i++) {
          var lineHeight = Math.round(this.heartRates[i + offset ] * this.canvas.height / 200);
          if (i === 0) {
            context.moveTo(11 * i, this.canvas.height - lineHeight);
          } else {
            context.lineTo(11 * i, this.canvas.height - lineHeight);
          }
          context.stroke();
        }
      }
    });
  }

  ngOnInit() {
    this.canvas = document.querySelector('canvas');
  }

}
