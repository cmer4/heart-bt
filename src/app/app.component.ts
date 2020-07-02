import { Component } from '@angular/core';
import { HeartRateService } from './heart-rate.service';
import { PopoverController } from '@ionic/angular';
import { PopoverComponent } from './popover/popover.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  heartRates: Array<number>;
  currentHeartRate: number;
  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  bpmTextStyle: {
    "position": string; 
    "color": string; 
    "transform": string; 
    "font-size": string 
  };
  heartColor: string;
  demoIntervalHolder: any; // Timeout

  constructor(
    private heartRate: HeartRateService,
    public popoverController: PopoverController
  ) {
  }

  async toggleHelpPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true
    });
    return await popover.present();
  }

  toggleFullScreen() {
    let winFeature = 'location=no,toolbar=no,menubar=no,scrollbars=no,resizable=yes';
    window.open('https://www.heart-bt.com','null',winFeature);
  };

  connectHeartRateSensor() {
    this.stopDemoInterval();
    this.heartRates = [];
    this.heartRate.connect()
      .then(() => this.heartRate.startNotificationsHeartRateMeasurement().then(this.handleHeartRateMeasurement))
      .catch(error => { console.log(error); this.startDemoInterval });
  };

  handleHeartRateMeasurement = (heartRateMeasurement) => {
    heartRateMeasurement.addEventListener('characteristicvaluechanged', event => {
      let heartRateMeasurement = this.heartRate.parseHeartRate(event.target.value);
      this.currentHeartRate = heartRateMeasurement.heartRate;
      this.heartRates.push(this.currentHeartRate);
      this.drawWaves();
    });
  };

  drawWaves() {
    if (this.heartRates.length > 100) {
      this.heartRates.splice(50, 50);
    };
    if (this.currentHeartRate < 75) {
      this.bpmTextStyle.color = 'green';
      this.heartColor = 'green';
    } else if (this.currentHeartRate > 75 && this.currentHeartRate < 100) {
      this.bpmTextStyle.color = 'orange';
      this.heartColor = 'orange';
    } else if (this.currentHeartRate > 120) {
      this.bpmTextStyle.color = 'red';
      this.heartColor = 'red';
    };
    requestAnimationFrame(() => {
      this.canvas.width = parseInt(getComputedStyle(this.canvas).width.slice(0, -2)) * devicePixelRatio;
      this.bpmTextStyle['font-size'] = this.canvas.width/30 + 'px'
      this.canvas.height = parseInt(getComputedStyle(this.canvas).height.slice(0, -2)) * devicePixelRatio;
      let margin = 2;
      let max = Math.max(0, Math.round(this.canvas.width / 11));
      let offset = Math.max(0, this.heartRates.length - max);
      this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (var i = 0; i < Math.max(this.heartRates.length, max); i++) {
        if (this.heartRates[i] < 75) {
          this.canvasContext.strokeStyle = 'green';
        } else if (this.heartRates[i] > 75 && this.heartRates[i] < 100) {
          this.canvasContext.strokeStyle = 'orange';
        } else if (this.heartRates[i] > 120) {
          this.canvasContext.strokeStyle = 'red';
        };
        let barHeight = Math.round(this.heartRates[i + offset ] * this.canvas.height / 200);
        this.canvasContext.strokeRect(11 * i + margin, this.canvas.height - barHeight, margin, Math.max(0, barHeight - margin));
      };
    });
  };

  stopDemoInterval() {
    if (this.demoIntervalHolder) {
      clearInterval(this.demoIntervalHolder);
      this.demoIntervalHolder = null;
    };
  };

  startDemoInterval() {
    this.demoIntervalHolder = setInterval(()=>{
      this.currentHeartRate = Math.floor(Math.random() * 90) + 50
      this.heartRates.push(this.currentHeartRate);
      this.drawWaves();
    }, 500);
  };

  ngOnInit() {
    this.heartRates = [];
    this.currentHeartRate = 0;
    this.bpmTextStyle = {
      position: "absolute", color: "gold", transform: "translate(-50%, -100%)", "font-size": "32px"
    };
    this.heartColor = "tomato";
    this.canvas = document.querySelector('canvas');
    this.canvasContext = this.canvas.getContext('2d');
    this.startDemoInterval();
  };

}
