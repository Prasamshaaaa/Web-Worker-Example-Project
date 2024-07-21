import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProcessorAComponent } from './processor-a/processor-a.component';
import { ProcessorBComponent } from './processor-b/processor-b.component';
import { ProcessorCComponent } from './processor-c/processor-c.component';
import { HealthCareListComponent } from './health-care-list/health-care-list.component';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@NgModule({
  declarations: [
    AppComponent,
    ProcessorAComponent,
    ProcessorBComponent,
    ProcessorCComponent,
    HealthCareListComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
