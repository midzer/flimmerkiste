import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mp3file'
})
export class Mp3filePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return 'assets/sets/' + value + '.mp3';
  }

}
