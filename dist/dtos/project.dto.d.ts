export declare class CreateProjectDto {
    customer: string;
    well: string;
    uwi_sidetrack: string;
    equipment: string;
    section: string;
    ing_day: string;
    ing_night: string;
    start_date: string;
    start_time: number;
    entry_depth: number;
}
export declare class CreateBhaDto {
    engine_od: string;
    engine_type: string;
    factor: number;
    trepan: string;
}
export declare class CreatePerforationDto {
    directional_profile_type: string;
    formation: string;
    bha: string;
    to_time: number;
    activity: string;
    depth_to: number;
    tf_type: string;
    tfo: string;
    rpm_surface: number;
    wob: number;
    caudal: number;
    tq_bottom: number;
    tq_out_bottom: number;
    spp_bottom: number;
    spp_out_bottom: number;
    peeg_bottom: number;
    peeg_out_bottom: number;
    peeg_rotating: number;
    mud_density: number;
    shift: string;
    md: number;
    tvd: number;
    incl: number;
    az: number;
    comments: string;
    pierced_feet_kpi: number;
    formations: string;
}
export declare class RopEfecKpiDto {
    depth: number;
    rop: number;
    _id?: string;
}
export declare class RopAvgKpiDto {
    depth: number;
    rop: number;
    _id?: string;
}
export declare class TripRopKpiDto {
    depth: number;
    rop: number;
    _id?: string;
}
export declare class ConexKpiDto {
    depth: number;
    rop: number;
    _id?: string;
}
export declare class ReviewKpiDto {
    time: number;
    _id?: string;
}
export declare class SurveyKpiDto {
    time: number;
    _id?: string;
}
export declare class TotalRcsDto {
    time: number;
}
export declare class CreateProjectStaticDataDto {
    rop_efec_kpi: RopEfecKpiDto[];
    rop_avg_kpi: RopAvgKpiDto[];
    trip_rop_kpi: TripRopKpiDto[];
    conex_kpi: ConexKpiDto[];
    review_kpi: ReviewKpiDto[];
    survey_kpi: SurveyKpiDto[];
}
