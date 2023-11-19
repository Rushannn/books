import { Directive, HostListener } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: '[trimInput]',
  standalone: true,
})
export class TrimInputDirective {

  constructor(private ngControl: NgControl) { }

  @HostListener('blur')
  onBlur(): void {
    if (this.ngControl && this.ngControl.control) {
      const currentValue = this.ngControl.control.value;
      if (typeof currentValue === 'string') {
        this.ngControl.control.setValue(currentValue.trim());
      }
    }
  }
}
