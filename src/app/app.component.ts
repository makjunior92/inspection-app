import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import {DistanceMatrixApiResponse} from "./DistanceMatrixApiResponse";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit{
  title = 'inspection-app';
  @ViewChild('addressField')
  addressField!:ElementRef;
  autoComplete: google.maps.places.Autocomplete | undefined;
  distanceService:any;

  distance:number = 0;
  distanceError:boolean = false;


   origin:string = "Greenwich, England"
  destination:string="Stockholm, Sweden"





  constructor(private formBuilder: FormBuilder,private http: HttpClient) { }

  inputForm = this.formBuilder.group({
    address: ['', Validators.required]
  });

  ngOnInit(): void {



  }

  ngAfterViewInit() {

    this.autoComplete = new google.maps.places.Autocomplete(this.addressField.nativeElement);


    this.autoComplete.addListener('place_changed',()=>{



      const place = this.autoComplete?.getPlace();
      const lat = place?.geometry?.location?.lat();
      const lng = place?.geometry?.location?.lng();

      this.inputForm.get("address")?.setValue(place?.formatted_address ?? '');

      console.log("lat: " + lat);
      console.log("lng: " + lng);
      console.log('address: ' + this.addressField.nativeElement.value);
      console.log('place: ' + place?.name);
      console.log('location: ' + place?.formatted_address);
      console.log('location: ' + this.inputForm.get("address")?.value);


      this.distanceService = new google.maps.DistanceMatrixService();

      // build request
      const originCoordinate = { lat: 35.7862338, lng: -78.68798 };
      const originAddress = "3708 Lexington Dr, Raleigh, NC 27606, USA";
      const destinationAddress = place?.formatted_address;
      const destinationCoordinate = { lat: lat, lng: lng };

      const request = {
        origins: [originCoordinate, originAddress],
        destinations: [destinationAddress, destinationCoordinate],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      };



      this.distanceService.getDistanceMatrix(request).then((
        response:DistanceMatrixApiResponse
      ) => {
        try {
          this.distance = Number(response.rows[0].elements[0].distance.value)/1000;
          console.log("distance response: " + this.distance);
        }catch (e){
          this.distance = 0;
          console.log(e + " no valid distance found");
        }

      }).catch((error:any)=>{

        console.error(error);
      });



    });


  }
}
