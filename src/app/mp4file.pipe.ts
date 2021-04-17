import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mp4file'
})
export class Mp4filePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return 'https://video.midzer.de/' + value + '.mp4';
  }

}
