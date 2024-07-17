import { Component } from '@angular/core';

@Component({
  selector: 'app-processor-b',
  templateUrl: './processor-b.component.html',
  styleUrls: ['./processor-b.component.css']
})
export class ProcessorBComponent {

  Data: number[] = [1, 2, 3, 4, 5];
  ManipulatedData: number[] = [];
  ManipulateData() {
    this.ManipulatedData = this.Data.map(item => item * 2);
  }
}
