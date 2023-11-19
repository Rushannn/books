import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { TableComponent } from 'src/app/shared/table/table.component';
import { Observable, take } from 'rxjs';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { TrimInputDirective, Author, TableHeader, DataService } from 'src/app/core';

interface AuthorForm {
  surname: FormControl<string>;
  name: FormControl<string>;
  patronymic: FormControl<string>;
  birthDate: FormControl<string>;
}

function dateValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null;
    }
    const value = control.value;

    if (!value) {
      return null;
    }
    const parts = control.value.split('-');
    if (parts.length !== 3) {
      return { 'dateInvalid': 'Формат даты должен быть ДД-ММ-ГГГГ' };
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return { 'dateInvalid': 'Недопустимый день или месяц' };
    }
    const date = new Date(year, month - 1, day);
    if (date && date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
      return null;
    }
    return { 'dateInvalid': 'Недействительная дата' };
  };
}

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableComponent,
    NgxMaskDirective,
    NgxMaskPipe,
    TrimInputDirective
  ],
  templateUrl: './authors.component.html',
  styleUrls: ['./authors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNgxMask()]
})
export class AuthorsComponent implements OnInit {

  public authorForm: FormGroup<AuthorForm>;
  public tableTitle: string = 'Авторы'
  public authorHeaders: TableHeader<Author>[] = [
    {
      name: 'id',
      title: 'ID',
      sort: 'off'
    },
    {
      name: 'surname',
      title: 'Фамилия',
      sort: 'none'
    },
    {
      name: 'name',
      title: 'Имя',
      sort: 'off'
    },
    {
      name: 'patronymic',
      title: 'Отчество',
      sort: 'off'
    },
    {
      name: 'birthDate',
      title: 'Дата рождения',
      sort: 'off'
    },
  ]
  public readonly authors$: Observable<Author[]> = this.dataService.authors$;
  public message = '';

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
  ) {
    this.authorForm = new FormGroup<AuthorForm>({
      surname: new FormControl("", {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
        nonNullable: true,
      }),
      name: new FormControl("", {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
        nonNullable: true,
      }),
      patronymic: new FormControl("", {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
        nonNullable: true,
      }),
      birthDate: new FormControl("", {
        validators: [Validators.required, dateValidator()],
        nonNullable: true,
      }),
    });
  }

  ngOnInit(): void {
    this.authorForm.get('birthDate')?.valueChanges
      .subscribe(value => {
        if (value && value.length === 8) {
          const formattedValue = value.substring(0, 2) + '-' + value.substring(2, 4) + '-' + value.substring(4);
          this.authorForm.get('birthDate')?.setValue(formattedValue, { emitEvent: false });
        }
      });
  }

  public onSubmit() {
    if (this.authorForm.valid) {
      const formValue = this.authorForm.value;
      this.dataService.authors$.pipe(
        take(1),
      ).subscribe(authors => {
        if (this.isAuthorDuplicate(formValue, authors)) {
          this.showMessage('Такой автор уже существует');
        } else {
          const newId = this.getNextId(authors);
          const newAuthor: Author = {
            id: newId,
            surname: formValue.surname!,
            name: formValue.name!,
            patronymic: formValue.patronymic!,
            birthDate: formValue.birthDate!
          };
          this.addAuthor(newAuthor);
          this.authorForm.reset();
        }
      });
    } else {
      this.showMessage('Форма не валидна');
    }
  }


  private addAuthor(newAuthor: Author) {
    this.dataService.addAuthor(newAuthor);
  }

  private getNextId(authors: Author[]): number {
    if (authors.length === 0) {
      return 1;
    }
    const maxId = Math.max(...authors.map(author => author.id));
    return maxId + 1;
  }

  private isAuthorDuplicate(formValue: Partial<Author>, authors: Author[]): boolean {
    console.log('authors', authors);
    console.log('formValue', formValue)
    return authors.some(author =>
      author.surname === formValue.surname &&
      author.name === formValue.name &&
      author.patronymic === formValue.patronymic &&
      author.birthDate === formValue.birthDate
    );
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
