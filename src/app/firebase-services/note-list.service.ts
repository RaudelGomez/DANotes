import { inject, Injectable, OnDestroy } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Firestore, collection, collectionData, doc, addDoc, onSnapshot, updateDoc, deleteDoc, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService implements OnDestroy {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];
  /**
   * Collection of notes when the version collectionData and Observables RxJS is used
   */
  // items$;
  // items;

  unsubNotes;
  unsubTrash;
  unsubMarkedNotes;

  firestore: Firestore = inject(Firestore);

  /**
   * This function load the data from Firebase
   */
  constructor() {
    //Version using onSnapShot
    this.unsubNotes = this.subNotesList();
    this.unsubTrash = this.subTrashList();
    this.unsubMarkedNotes = this.subNotesMarkedList();
    
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
    this.unsubMarkedNotes();
    //Version collectiondata and Observables (RxJS)
    //this.items.unsubscribe();
  }

  /**
   * This function return the array of notes that are not in the trash (READ)
   * @returns [notes]
   */
  subNotesList(){
    //Subcollection example way1
    //let ref = collection(this.firestore, "notes/y1M0JVK3ft7MaUgayix2/extra");
    //Subcollection example way2
    // let ref = collection(doc(collection(this.firestore, "notes"), "y1M0JVK3ft7MaUgayix2"), "extra");
    // const q = query(ref, orderBy("title"), limit(100));

    //This query show only the notes until limit () and sort the for the (orderBy) Variable
    //If you wanna use orderBy and where toguether, you have to refer to the same propierty(In this case "marked")
    const q = query(this.getNotesRef(), orderBy("title"), limit(100));
    return onSnapshot(q, (list)=>{
      this.normalNotes = [];
      list.forEach(element =>{
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
      //To see the change in the document when some of this action will be done
      list.docChanges().forEach((change) => {
        if (change.type === "added") {
            console.log("New note: ", change.doc.data());
        }
        if (change.type === "modified") {
            console.log("Modified note: ", change.doc.data());
        }
        if (change.type === "removed") {
            console.log("Removed note: ", change.doc.data());
        }
      });
    });
  }

   /**
   * This function return the array of notes that are not in the trash (READ) and the were saved
   * @returns [notes]
   */
   subNotesMarkedList(){
    //This query show only the notes until limit () and sort the for the (orderBy) Variable
    //If you wanna use orderBy and where toguether, you have to refer to the same propierty(In this case "marked")
    const q = query(this.getNotesRef(), limit(100), where("marked", "==", true));
    return onSnapshot(q, (list)=>{
      this.normalMarkedNotes = [];
      list.forEach(element =>{
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));
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
   * This function add a note to the Firestore database (CREATE)
   * The callback return an error if that note could not be created
   * or a message in the console with the ID of the cretaed note
   * @param item - The Note, that will be added to Firestore
   */
  async addNote(item: Note, colId: "notes" | "trash"){
    if(colId == "notes"){
      await addDoc(this.getNotesRef(), item).catch(
        (err)=> { console.error(err);}
      ).then(
        (docRef)=> {console.log("Document creared with ID: ", docRef!.id);}
      )
    }else{
      await addDoc(this.getTrashRef(), item).catch(
        (err)=> { console.error(err);}
      ).then(
        (docRef)=> {console.log("Document creared with ID: ", docRef!.id);}
      )
    }

    // if (colId == 'note') {
    //   await addDoc(this.getNotesRef(), item)
    //     .catch((err) => {
    //       console.error(err);
    //     })
    //     .then((docRef) => {
    //       console.log('Document written with ID: ', docRef?.id);
    //     });
    // } else {
    //   await addDoc(this.getTrashRef(), item)
    //     .catch((err) => {
    //       console.error(err);
    //     })
    //     .then((docRef) => {
    //       console.log('Document written with ID: ', docRef?.id);
    //     });
    // }
  }

  /**
   * This function updates a note in Firebase
   * (UPDATE)
   */
  async updateNote(note: Note){
    if(note.id){
      let docRef = this.getSingleDocTef(this.getColIdFromCollection(note), note.id); 
      await updateDoc(docRef, this.getCleanJSON(note)).catch(
        (err)=>{ console.error(err)}
      ).then(
        () => {console.log(`Document with ${note.id}  was updated`);}
      );
    }
  }

  /**
   * That is a help function to clean the JSOn
   * Due to the type in the function updateNote must do that
   * @param note - Object Note
   * @returns Return every propierty of the object note
   */
  getCleanJSON(note:Note){
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    }
  }

  /**
   * This function resolve the problem of Id in the Firebase (Notes) and the type of a note * (note)
   * @param note- Object Note
   * @returns - Id of the collection in Firebase notes | trash
   */
  getColIdFromCollection(note:Note){
    if(note.type == 'note'){
      return 'notes'
    }else{
      return 'trash'
    }
  }

  /**
   * This function delete a document in the Firebase (DELETE)
   * @param colId - Collection Id in Firebase
   * @param docId - Id of the document to delete
   */
  async deleteNote(colId: "notes" | "trash", docId:string){
    await deleteDoc(this.getSingleDocTef(colId, docId)).catch(
      (err)=> {console.error(err);}
    ).then(
      ()=> {console.log(`Document with ${docId} was deleted`);}
    )
  }
}
