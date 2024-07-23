import { inject, Injectable } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Firestore, collection, collectionData, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  /**
   * Collection of notes
   */
  items$;
  firestore: Firestore = inject(Firestore);

  /**
   * This function load the data from Firebase
   */
  constructor() {
    this.items$ = collectionData(this.getNotesRef());
  }

  /**
   * This function get the collection of notes in Firebase (notes is the id in Firebase)
   * @returns The collection of notes from Firebase
   */
  getNotesRef(){
    return collection(this.firestore, 'notes');
  }

  /**
   * This function get the collection of trash in Firebase (trash is the id in Firebase)
   * @returns The collection of trash from Firebase
   */
  getTrashRef(){
    return collection(this.firestore, 'trash');
  }

  /**
   * This function return a single doc in a collection.
   * @param colId - Collection id (name) in Firebase
   * @param docId - Id of the document in this collection in Firebase
   * @returns The complete doc in this collection
   */
  getSingleDocTef(colId:string, docId:string){
    return doc(collection(this.firestore, colId), docId);
  }
}
