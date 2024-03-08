import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'webmfile',
    standalone: true
})
export class WebmfilePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return '/video/' + value + '.webm';
  }

}
