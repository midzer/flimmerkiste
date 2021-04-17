import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'webmfile'
})
export class WebmfilePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return 'https://video.midzer.de/' + value + '.webm';
  }

}
