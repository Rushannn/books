import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Author, Book } from "../models";


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private authorsSubject = new BehaviorSubject<Author[]>([]);
  public authors$ = this.authorsSubject.asObservable();

  private booksSubject = new BehaviorSubject<Book[]>([]);
  public books$ = this.booksSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAuthors();
    this.loadBooks();
  }

  private loadAuthors() {
    const localData = localStorage.getItem('authors');
    if (localData) {
      this.authorsSubject.next(JSON.parse(localData));
    } else {
      this.http.get<Author[]>('/assets/authors.json').subscribe(data => {
        localStorage.setItem('authors', JSON.stringify(data));
        this.authorsSubject.next(data);
      });
    }
  }

  private loadBooks() {
    const localData = localStorage.getItem('books');
    if (localData) {
      this.booksSubject.next(JSON.parse(localData));
    } else {
      this.http.get<Book[]>('/assets/books.json').subscribe(data => {
        localStorage.setItem('books', JSON.stringify(data));
        this.booksSubject.next(data);
      });
    }
  }

  addAuthor(author: Author) {
    const currentAuthors = this.authorsSubject.value;
    const updatedAuthors = [...currentAuthors, author];
    this.authorsSubject.next(updatedAuthors);
    localStorage.setItem('authors', JSON.stringify(updatedAuthors));
  }

  addBook(book: Book) {
    const currentBooks = this.booksSubject.value;
    const updatedBooks = [...currentBooks, book];
    this.booksSubject.next(updatedBooks);
    localStorage.setItem('books', JSON.stringify(updatedBooks));
  }

}
