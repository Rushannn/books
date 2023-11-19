import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableHeader } from 'src/app/core/models';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T> {
  @Input() headers!: TableHeader<T>[];
  @Input() items: T[] = [];
  @Input() tableTitle!: string

  sort(name: keyof T) {
    let sortDirection = null;
    this.headers.forEach(header => {
      if (header.sort !== 'off') {
        if (header.name === name) {
          switch (header.sort) {
            case 'none':
              header.sort = 'asc';
              sortDirection = 'asc';
              break;
            case 'asc':
              header.sort = 'desc';
              sortDirection = 'desc';
              break;
            case 'desc':
              header.sort = 'asc';
              sortDirection = 'asc';
              break;
            default:
              header.sort = 'none';
              break;
          }
        } else {
          header.sort = 'none';
        }
      }
    });


    if (sortDirection === 'asc') {
      this.items.sort((a, b) => String(b[name]).localeCompare(String(a[name])));
    } else if (sortDirection === 'desc') {
      this.items.sort((a, b) => String(a[name]).localeCompare(String(b[name])));
    }
    console.log('this.items', this.items);
  }

}

