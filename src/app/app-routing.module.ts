import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/authors',
    pathMatch: 'full'
  },
  {
    path: "authors",
    loadComponent: () =>
      import("./features/authors/authors.component").then((m) => m.AuthorsComponent),
  },
  {
    path: "books",
    loadComponent: () =>
      import("./features/books/books.component").then((m) => m.BooksComponent),
  },
  {
    path: '**',
    redirectTo: '/authors',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
