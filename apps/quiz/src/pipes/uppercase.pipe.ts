import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class UppercasePipe implements PipeTransform {
  transform(value: string) {
    return value.toUpperCase();
  }
}
