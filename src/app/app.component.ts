import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PresModel } from './model/PresModel';
import * as data from '../assets/json/Country.json';
import { FirebaseService } from './service/firebase.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'PharMedic';
  countries: any = [];
  PrescriptionForm: FormGroup;
  edit = false;
  add = true;
  editPres: any;
  filePath: string;
  prescriptions: any = [];
  downloadURL: any;
  constructor(
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService,
    private fireStorage: AngularFireStorage,
    private router: Router
  ) {}
  // tslint:disable: typedef
  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit() {
    this.firebaseService.getPrescription().then((res) => {
      this.prescriptions = res;
    });
    this.countries = (data as any).default;
    this.initializeForm();
  }

  upload(event) {
    this.filePath = event.target.files[0];
  }

  initializeForm() {
    this.PrescriptionForm = this.formBuilder.group({
      firstName: [null],
      lastName: [null],
      email: [null],
      dateOfBirth: [null],
      medicine: [null],
      country: ['0'],
      doctorName: [null],
      prescriptionDetail: [null],
    });
  }
  onSubmit() {
    let temp = new PresModel();
    if (this.edit === true) {
      this.onDelete(this.editPres);
    }
    temp = this.PrescriptionForm.value;
    temp = this.updateCountry(temp);
    temp.age = this.calculateAge(temp.dateOfBirth);
    const path = '/images' + Math.random() + this.filePath;
    temp.prescriptionDetail = path;
    this.edit = false;

    // creating record and uploading files
    this.fireStorage.upload(path, this.filePath);

    this.firebaseService
      .createPrescription(temp)
      .catch((err) => console.log(err));
    this.initializeForm();
  }

  calculateAge(dateOfBirth: Date) {
    const today = new Date();
    if (dateOfBirth == null) {
      return 0;
    }
    const dob = new Date(dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  updateCountry(temp) {
    if (temp.country === '0') {
      temp.country = 'Not Selected';
    }
    return temp;
  }

  clear() {
    this.add = true;
    this.edit = false;
    this.initializeForm();
  }

  onEdit(prescription: any) {
    this.editPres = prescription;
    this.add = false;
    this.edit = true;
    this.PrescriptionForm = this.formBuilder.group({
      firstName: prescription.payload.doc.data().firstName,
      lastName: prescription.payload.doc.data().lastName,
      email: prescription.payload.doc.data().email,
      dateOfBirth: prescription.payload.doc.data().dateOfBirth,
      medicine: prescription.payload.doc.data().medicine,
      country: prescription.payload.doc.data().country,
      doctorName: prescription.payload.doc.data().doctorName,
      prescriptionDetail: prescription.payload.doc.data().prescriptionDetail,
    });
  }

  viewImage(url) {
    const newUrl = this.fireStorage.ref(url).getDownloadURL();
    this.downloadURL = this.fireStorage.ref(url).getDownloadURL();
  }

  onDelete(prescription: any) {
    this.firebaseService.deletePrescription(prescription).then(() => {
      location.reload();
    });
  }
}
