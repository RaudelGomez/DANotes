import { inject, Injectable, OnDestroy } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Firestore, collection, collectionData, doc, addDoc, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService implements OnDestroy {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  /**
   * Collection of notes when the version collectionData and Observables RxJS is used
   */
  // items$;
  // items;

  unsubNotes;
  unsubTrash;

  firestore: Firestore = inject(Firestore);

  /**
   * This function load the data from Firebase
   */
  constructor() {
    //Version using onSnapShot
    this.unsubNotes = this.subNotesList();
    this.unsubTrash = this.subTrashList();
    
    //Version using collectionData and Observables RxJS
    // this.items$ = collectionData(this.getNotesRef());
    // this.items = this.items$.subscribe((list)=>{
    //   list.forEach(element => {
    //     console.log(element);
    //   })
    // });
    
  }

  /**
   * This Function destroy all data if the component is not loaded anymore
   */
  ngOnDestroy(){
    this.unsubNotes();
    this.unsubTrash();
    //Version collectiondata and Observables (RxJS)
    //this.items.unsubscribe();
  }

  /**
   * This function return the array of notes that are not in the trash
   * @returns [notes]
   */
  subNotesList(){
    return onSnapshot(this.getNotesRef(), (list)=>{
      this.normalNotes = [];
      list.forEach(element =>{
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      })
    });
  }

  /**
   * This function return the array of notes in the trash
   * @returns [notes]
   */
  subTrashList(){
    return onSnapshot(this.getTrashRef(), (list)=>{
      this.trashNotes = [];
      list.forEach(element =>{
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      })
    });
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

  /**
   * This function set a complete note
   * @param obj - The complete object with the patron Note from firebase
   * @param id - That is the id in firebase ogf that object
   * @returns The complete Element with the data. If this one has data is ok, if not * will fill it with empty data due to OR operator
   */
  setNoteObject(obj:any, id:string): Note{
    return {
      id: id,
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false,
    }
  }
  
  /**
   * This function add a note to the Firestore database
   * The callback return an error if that note could not be created
   * or a message in the console with the ID of the cretaed note
   * @param item - The Note, that will be added to Firestore
   */
  async addNote(item: Note){
    await addDoc(this.getNotesRef(), item).catch(
      (err)=> { console.error(err);}
    ).then(
      (docRef)=> {console.log("Document creared with ID: ", docRef!.id);}
    )
  }
}
