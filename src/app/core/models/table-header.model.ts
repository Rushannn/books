export interface TableHeader<T> {
  name: keyof T;
  title: string;
  sort: 'none' | 'asc' | 'desc' | 'off';
}
