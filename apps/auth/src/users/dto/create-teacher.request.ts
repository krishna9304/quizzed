import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  ValidationArguments,
  registerDecorator,
} from 'class-validator';

export function IsSOAEmail() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSOAEmail',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any) {
          if (!value) {
            return true;
          }

          const emailParts = value.split('@');
          const emailHost = emailParts[1];

          return emailHost === 'soa.ac.in';
        },
        defaultMessage(validationArguments?: ValidationArguments) {
          return `Email host should be 'soa.ac.in'`;
        },
      },
    });
  };
}

export class CreateTeacherRequest {
  @IsNotEmpty()
  @IsEmail()
  @IsSOAEmail()
  email: string;

  regdNo: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsMobilePhone('en-IN')
  primaryPhone: string;

  subjects: string[];

  status: string;

  created_at: string;

  updated_at: string;

  metadata: any;
}
