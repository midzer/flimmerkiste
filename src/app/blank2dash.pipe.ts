import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'blank2dash'
})
export class Blank2dashPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return value.split(' ').join('-');
  }

}
