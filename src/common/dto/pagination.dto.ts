import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  limit: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fuel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transmission?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  seats?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isAvailable?: string;


  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  priceRange?: number;


  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortOrder?: string
}
