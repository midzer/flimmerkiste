import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'sanitizedUrl',
    standalone: true
})
export class SanitizedUrlPipe implements PipeTransform {
    constructor(private sanitized: DomSanitizer) {}
    transform(value: any): any {
    return this.sanitized.bypassSecurityTrustUrl(value);
    }
}
