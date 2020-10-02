import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(private angularFirestore: AngularFirestore) {}

  // tslint:disable: typedef
  createPrescription(data) {
    return new Promise<any>((reject) => {
      this.angularFirestore
        .collection('Prescription')
        .add(data)
        .then(
          (res) => {
            console.log(res);
          },
          (err) => reject(err)
        );
    });
  }

  getPrescription() {
    return new Promise<any>((resolve) => {
      this.angularFirestore
        .collection('/Prescription')
        .snapshotChanges()
        .subscribe((snapshots) => {
          resolve(snapshots);
        });
    });
  }

  deletePrescription(data) {
    return this.angularFirestore
      .collection('/Prescription')
      .doc(data.payload.doc.id)
      .delete();
  }
}
