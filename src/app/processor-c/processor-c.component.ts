import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-processor-c',
  templateUrl: './processor-c.component.html',
  styleUrls: ['./processor-c.component.css',

  ]
})
export class ProcessorCComponent implements OnInit {
  private Worker!: Worker; //property to hold the instance of the web worker
  public Result!: number;

  constructor() { }

  ngOnInit() {
    /**
     * @summary - checks if the browser supports the web workers and if supported, it creates a new instance of web workers specifying path to worker and onmessage() method listen for the message from worker and it updates 'Result' after receiving message from worker
     *  */
    if (typeof Worker !== 'undefined') {
      this.Worker = new Worker(new URL('../processor-c.worker', import.meta.url));
      this.Worker.onmessage = ({ data }: { data: number }) => {
        this.Result = data;
        console.log(`Worker result: ${data}`);
      };
    } else {
      console.log('Web workers are not supported in this environment.');
    }
  }

  StartComputation() {
    if (this.Worker) {
      // This function allows computation between main thread and the worker, initiating the computation defined in worker
      this.Worker.postMessage(42);
    }
  }
}
