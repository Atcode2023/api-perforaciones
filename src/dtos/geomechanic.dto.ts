import { IsString, IsNumber, IsBoolean, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class LithologyEntryDto {
  @IsString() name: string;
  @IsBoolean() present: boolean;
}

export class CreateGeomechanicDto {
  @IsOptional() @IsString() project?: string;
  @IsString() section: string;
  @IsString() hour_24h: string; // HH:mm
  @IsNumber() lag_depth_ft: number;
  @IsString() event: string;
  @IsBoolean() derrumbes: boolean;
  @IsOptional() @IsNumber() morphology_retrab_pct?: number;
  @IsOptional() @IsNumber() morphology_normal_pct?: number; // porcentaje Normal
  @IsOptional() @IsNumber() morphology_angular_pct?: number;
  @IsOptional() @IsNumber() morphology_tabular_pct?: number;
  @IsOptional() @IsNumber() morphology_astilloso_pct?: number;
  @IsArray() @ValidateNested({ each: true }) @Type(() => LithologyEntryDto) lithologies: LithologyEntryDto[];
  // Campos globales (antes por litología individual)
  @IsOptional() @IsNumber() min_mm?: number;
  @IsOptional() @IsNumber() max_mm?: number;
  @IsOptional() @IsNumber() avg_mm?: number;
  @IsOptional() @IsNumber() cuttings_rate_bph?: number;
  @IsOptional() @IsNumber() excess_deficit_bbl?: number;
  @IsOptional() @IsString() inc_zarandas?: string;
  @IsOptional() @IsNumber() mw_lpg?: number;
  @IsOptional() @IsNumber() ecd_lpg?: number;
  @IsOptional() @IsString() remarks?: string;
  // morphology_normal_pct agregado y coercionado en la ruta
  // image se maneja por multipart
}

export class UpdateGeomechanicDto extends CreateGeomechanicDto {}
