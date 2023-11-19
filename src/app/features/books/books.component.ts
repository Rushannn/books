import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { TableComponent } from 'src/app/shared/table/table.component';
import { Observable, pipe, take } from 'rxjs';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { Author, Book, DataService, TableHeader, TrimInputDirective } from 'src/app/core';

interface BookForm {
  author: FormControl<string>;
  name: FormControl<string>;
  publisher: FormControl<string>;
  year: FormControl<string>;
}

interface ExtendedAuthor extends Author {
  fullName: string;
}

function yearValidator(minYear: number, maxYear: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null;
    }
    const year = parseInt(control.value, 10);
    const isValidYear = !isNaN(year) && year >= minYear && year <= maxYear;
    return isValidYear ? null : { 'year': `Год должен быть между ${minYear} и ${maxYear}` };
  };
}


@Component({
  selector: 'app-books',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    TrimInputDirective
  ],
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNgxMask()]
})
export class BooksComponent implements OnInit {
  public tableTitle = 'Книги';
  public bookForm: FormGroup<BookForm>;
  public bookHeaders: TableHeader<Book>[] = [
    {
      name: 'id',
      title: 'ID',
      sort: 'off'
    },
    {
      name: 'author',
      title: 'Автор',
      sort: 'none'
    },
    {
      name: 'name',
      title: 'Название',
      sort: 'off'
    },
    {
      name: 'publisher',
      title: 'Издательство',
      sort: 'none'
    },
    {
      name: 'year',
      title: 'Год издания',
      sort: 'none'
    }
  ];
  public authors: ExtendedAuthor[] = [];
  public message = '';

  public readonly books$: Observable<Book[]> = this.dataService.books$;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
  ) {
    this.bookForm = new FormGroup<BookForm>({
      author: new FormControl("", {
        validators: [Validators.required],
        nonNullable: true,
      }),
      name: new FormControl("", {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
        nonNullable: true,
      }),
      publisher: new FormControl("", {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
        nonNullable: true,
      }),
      year: new FormControl("", {
        validators: [Validators.required, yearValidator(1900, new Date().getFullYear())],
        nonNullable: true,
      }),
    });
  }

  ngOnInit() {
    this.dataService.authors$
      .pipe(take(1))
      .subscribe(data => {
        this.authors = data.map(author => ({
          ...author,
          fullName: `${author.surname} ${author.name} ${author.patronymic}`
        }));
      });
  }

  onSubmit() {
    if (this.bookForm.valid) {
      const formValue = this.bookForm.value;
      this.dataService.books$.pipe(
        take(1)
      ).subscribe(
        books => {
          const nextId = this.getNextId(books);
          const newBook = {
            id: nextId,
            name: formValue.name!,
            author: formValue.author!,
            publisher: formValue.publisher!,
            year: formValue.year!
          };
          this.dataService.addBook(newBook);
          this.bookForm.reset();
        }
      )
    } else {
      this.showMessage('Форма не валидна');
    }
  }

  private getNextId(items: { id: number }[]): number {
    if (items.length === 0) {
      return 1;
    }
    const maxId = Math.max(...items.map(item => item.id));
    return maxId + 1;
  }

  private showMessage(message: string) {
    this.message = message;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.message = '';
      this.cdr.markForCheck();
    }, 3000);
  }

}
