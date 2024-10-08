import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
import { PageDTO } from "src/common/dto/page.dto";

export class GetArticleTypeDTO extends PageDTO {
    @ApiProperty()
    @IsOptional()
    @IsIn(['id'])
    field: string;
  }