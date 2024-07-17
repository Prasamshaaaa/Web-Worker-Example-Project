import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProcessorAComponent } from './processor-a/processor-a.component';
import { ProcessorBComponent } from './processor-b/processor-b.component';
import { ProcessorCComponent } from './processor-c/processor-c.component';

@NgModule({
  declarations: [
    AppComponent,
    ProcessorAComponent,
    ProcessorBComponent,
    ProcessorCComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
