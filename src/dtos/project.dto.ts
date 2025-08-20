import { IsString, IsNumber, IsDate, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { ObjectId } from 'mongodb';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @IsString()
  customer: string;

  @IsString()
  well: string;

  @IsString()
  uwi_sidetrack: string;

  @IsString()
  equipment: string;

  @IsString()
  section: string;

  @IsString()
  ing_day: string; // Debe ser el _id del usuario

  @IsString()
  ing_night: string; // Debe ser el _id del usuario

  @IsString()
  supervisor?: string; // Debe ser el _id del usuario, opcional

  @IsString()
  start_date: string;

  @IsNumber()
  start_time: number;

  @IsNumber()
  entry_depth: number;
}

export class CreateBhaDto {
  @IsString()
  engine_od: string;

  @IsString()
  engine_type: string;

  @IsNumber()
  factor: number;

  @IsString()
  trepan: string;
}

export class CreatePerforationDto {
  @IsString()
  directional_profile_type: string;

  @IsString()
  formation: string;

  @IsString()
  bha: string;

  @IsNumber()
  to_time: number;

  @IsString()
  activity: string;

  @IsNumber()
  depth_to: number;

  @IsString()
  tf_type: string;

  @IsString()
  tfo: string;

  @IsNumber()
  rpm_surface: number;

  @IsNumber()
  wob: number;

  @IsNumber()
  caudal: number;

  @IsNumber()
  tq_bottom: number;

  @IsNumber()
  tq_out_bottom: number;

  @IsNumber()
  spp_bottom: number;

  @IsNumber()
  spp_out_bottom: number;

  @IsNumber()
  peeg_bottom: number;

  @IsNumber()
  peeg_out_bottom: number;

  @IsNumber()
  peeg_rotating: number;

  @IsNumber()
  mud_density: number;

  @IsString()
  shift: string;

  @IsNumber()
  md: number;

  @IsNumber()
  tvd: number;

  @IsNumber()
  incl: number;

  @IsNumber()
  az: number;

  @IsString()
  comments: string;

  @IsNumber()
  pierced_feet_kpi: number;

  @IsString()
  formations: string;
}

export class RopEfecKpiDto {
  @IsNumber()
  depth: number;

  @IsNumber()
  rop: number;

  @IsOptional()
  @IsString()
  _id?: string;
}

export class RopAvgKpiDto {
  @IsNumber()
  depth: number;

  @IsNumber()
  rop: number;

  @IsOptional()
  @IsString()
  _id?: string;
}

export class TripRopKpiDto {
  @IsNumber()
  depth: number;

  @IsNumber()
  rop: number;

  @IsOptional()
  @IsString()
  _id?: string;
}

export class ConexKpiDto {
  @IsNumber()
  depth: number;

  @IsNumber()
  rop: number;

  @IsOptional()
  @IsString()
  _id?: string;
}

export class ReviewKpiDto {
  @IsNumber()
  time: number;

  @IsOptional()
  @IsString()
  _id?: string;
}

export class SurveyKpiDto {
  @IsNumber()
  time: number;

  @IsOptional()
  @IsString()
  _id?: string;
}

export class TotalRcsDto {
  @IsNumber()
  time: number;
}

export class CreateProjectStaticDataDto {
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RopEfecKpiDto)
  rop_efec_kpi: RopEfecKpiDto[];

  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RopAvgKpiDto)
  rop_avg_kpi: RopAvgKpiDto[];

  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TripRopKpiDto)
  trip_rop_kpi: TripRopKpiDto[];

  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConexKpiDto)
  conex_kpi: ConexKpiDto[];

  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewKpiDto)
  review_kpi: ReviewKpiDto[];

  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SurveyKpiDto)
  survey_kpi: SurveyKpiDto[];

  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => TotalRcsDto)
  // total_rcs: TotalRcsDto[];
}
