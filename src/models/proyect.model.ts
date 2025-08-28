import { ObjectId } from "mongodb";
import { paginate } from "../paginate";
import { QueryResult } from "../paginate/paginate";
import { Schema, model, Model, Types } from "mongoose";

export interface Bha {
  _id: any;
  engine_od: string;
  engine_type: string;
  factor: number;
  trepan: string;
}

export interface Perforations {
  _id?: any;
  directional_profile_type: string;
  formation: string;
  bha: ObjectId;
  created_at: Date;
  from_time: number;
  to_time: number;
  time: number;
  activity: string;
  circulates_out_of_background: number;
  depth_from: number;
  depth_to: number;
  drilled_meters: number;
  effective_rop: number;
  tf_type: string;
  tfo: string;
  rpm_surface: number;
  total_rpm: number;
  wob: number;
  caudal: number;
  tq_bottom: number;
  tq_out_bottom: number;
  spp_bottom: number;
  spp_out_bottom: number;
  differential_pressure: number;
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
  rop_kpi: number;
  rop_efe_kpi: number;
  rop_trips: number;
  rop_avg: number;
  pierced_feet_kpi: number;
  formations: string;
  footage?: number; // Distancia recorrida en pies
  dls?: number;//DLS °/100p en survey
}

export interface Project {
  _id?: any;
  customer: string;
  well: string;
  uwi_sidetrack: string;
  equipment: string;
  section: string;
  ing_day: Types.ObjectId | string; // Referencia al usuario
  ing_night: Types.ObjectId | string; // Referencia al usuario
  supervisor?: Types.ObjectId | string; // Referencia al usuario
  start_date: Date;
  start_time: number;
  entry_depth: number;
  departure_date: Date;
  exit_depth: number;
  progress: number;
  bhas: Bha[];
  project_static_data?: ProjectStaticData;
  perforations: Perforations[];
  created_at?: Date;
  deleted_at?: Date | null;
  has_changes: Date | null;
}

export interface ProjectStaticData {
  rop_efec_kpi: RopEfecKpi[];
  rop_avg_kpi: RopAvgKpi[];
  trip_rop_kpi: TripRopKpi[];
  conex_kpi: ConexKpi[];
  review_kpi: ReviewKpi[];
  survey_kpi: SurveyKpi[];
  total_rcs: TotalRcs[];
}

export interface RopEfecKpi {
  _id?: any;
  depth: number;
  rop: number;
}

export interface RopAvgKpi {
  _id?: any;
  depth: number;
  rop: number;
}

export interface TripRopKpi {
  _id?: any;
  depth: number;
  rop: number;
}

export interface ConexKpi {
  _id?: any;
  depth: number;
  rop: number;
}

export interface ReviewKpi {
  _id?: any;
  time: number;
}

export interface SurveyKpi {
  _id?: any;
  time: number;
}

export interface TotalRcs {
  _id?: any;
  time: number;
}

export interface IUProyectModel extends Model<Project> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<QueryResult>;
}

const projectSchema: Schema = new Schema<Project, IUProyectModel>({
  has_changes: { type: Date, default: Date.now },
  customer: {
    type: String,
    required: true,
  },
  well: {
    type: String,
    required: true,
  },
  uwi_sidetrack: {
    type: String,
    required: true,
  },
  equipment: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  ing_day: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  supervisor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Opcional
  },
  ing_night: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  start_time: {
    type: Number,
    required: true,
  },
  entry_depth: {
    type: Number,
    required: true,
  },
  departure_date: {
    type: Date,
    required: false,
  },
  exit_depth: {
    type: Number,
    required: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
  bhas: [
    {
      engine_od: { type: String, required: true },
      engine_type: { type: String, required: true },
      factor: { type: Number, default: 1.0 },
      trepan: { type: String, default: "" },
    },
  ],
  project_static_data: {
    rop_efec_kpi: [
      {
        depth: { type: Number, required: true },
        rop: { type: Number, required: true },
      },
    ],
    rop_avg_kpi: [
      {
        depth: { type: Number, required: true },
        rop: { type: Number, required: true },
      },
    ],
    trip_rop_kpi: [
      {
        depth: { type: Number, required: true },
        rop: { type: Number, required: true },
      },
    ],
    conex_kpi: [
      {
        depth: { type: Number, required: true },
        rop: { type: Number, required: true },
      },
    ],
    review_kpi: [
      {
        time: { type: Number, required: true },
      },
    ],
    survey_kpi: [
      {
        time: { type: Number, required: true },
      },
    ],
    total_rcs: [
      {
        time: { type: Number, required: true },
      },
    ],
  },
  perforations: [
    {
      directional_profile_type: { type: String, required: true },
      formation: { type: String, required: true },
      bha: { type: String, required: true },
      created_at: { type: Date, default: Date.now },
      from_time: { type: Number, required: true },
      to_time: { type: Number, required: true },
      time: { type: Number, required: true },
      activity: { type: String, required: true },
      circulates_out_of_background: { type: Number, default: 0 },
      depth_from: { type: Number, required: true },
      depth_to: { type: Number, required: true },
      drilled_meters: { type: Number, default: 0 },
      effective_rop: { type: Number, default: 0 },
      tf_type: { type: String, default: "" },
      tfo: { type: String, required: true },
      rpm_surface: { type: Number, default: 0 },
      total_rpm: { type: Number, default: 0 },
      wob: { type: Number, default: 0 },
      caudal: { type: Number, default: 0 },
      tq_bottom: { type: Number, default: 0 },
      tq_out_bottom: { type: Number, default: 0 },
      spp_bottom: { type: Number, default: 0 },
      spp_out_bottom: { type: Number, default: 0 },
      differential_pressure: { type: Number, default: 0 },
      peeg_bottom: { type: Number, default: 0 },
      peeg_out_bottom: { type: Number, default: 0 },
      peeg_rotating: { type: Number, default: 0 },
      mud_density: { type: Number, default: 0 },
      shift: { type: String, default: "" },
      md: { type: Number, default: 0 },
      tvd: { type: Number, default: 0 },
      incl: { type: Number, default: 0 },
      az: { type: Number, default: 0 },
      dls: { type: Number, default: 0 },
      comments: { type: String, default: "" },
      rop_kpi: { type: Number, default: 0 },
      rop_efe_kpi: { type: Number, default: 0 },
      rop_trips: { type: Number, default: 0 },
      rop_avg: { type: Number, default: 0 },
      pierced_feet_kpi: { type: Number, default: 0 },
      formations: { type: String, required: true },
      footage: { type: Number, default: 0 }, // Distancia recorrida en pies
    },
  ],
});

projectSchema.plugin(paginate);

projectSchema.methods.softDelete = async function () {
  if (this.deleted_at) return this; // Ya eliminado
  await projectModel.updateOne({ _id: this._id }, { $set: { deleted_at: new Date() } });
  this.deleted_at = new Date();
  return this;
};

const projectModel = model<Project, IUProyectModel>("Project", projectSchema);

export default projectModel;
