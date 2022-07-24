import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class TodoDto {
  @IsNotEmpty()
  @MaxLength(250)
  title: string;

  @IsOptional()
  @MaxLength(500)
  description: string;

  @IsOptional()
  @IsDateString()
  deadline: Date;
}

export class TodoPatchDto extends TodoDto {
  @IsOptional()
  @MaxLength(250)
  title: string;

  @IsOptional()
  @IsBoolean()
  done: boolean;
}

export class TodoDeleteDto {
  @IsNotEmpty()
  @IsArray()
  ids: Array<number>;
}
