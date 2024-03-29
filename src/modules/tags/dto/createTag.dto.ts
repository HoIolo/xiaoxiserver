import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 15)
  tagName: string;
}
