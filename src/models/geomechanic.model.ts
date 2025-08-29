import { Schema, model, Types, Model } from "mongoose";

export interface LithologyEntry {
  name: string; // Claystone, Volcanic Tuff, etc
  present: boolean; // marcado con X
}

export interface GeomechanicProject {
  _id?: any;
  project?: Types.ObjectId; // Referencia opcional a Project principal
  section: string; // Ej: 8 1/2"
  sample_time: Date; // Fecha/hora real de la muestra
  hour_24h: string; // Hora (24h) mostrada en la planilla
  lag_depth_ft: number; // Prof. LAG (pies)
  event: string; // Evento (MONITOREO, etc)
  derrumbes: boolean; // Checkbox derrumbes SI/NO
  morphology_retrab_pct?: number; // Retrab. %
  morphology_normal_pct?: number; // Normal % (nuevo)
  morphology_angular_pct?: number;
  morphology_tabular_pct?: number;
  morphology_astilloso_pct?: number;
  lithologies: LithologyEntry[];
  // Campos globales para el registro (ya no por litología individual)
  min_mm?: number;
  max_mm?: number;
  avg_mm?: number;
  cuttings_rate_bph?: number; // Tasa promedio de cortes
  excess_deficit_bbl?: number; // Exceso / Déficit (bbl)
  inc_zarandas?: string; // Inc. Zarandas (texto libre)
  mw_lpg?: number; // MW (lpg)
  ecd_lpg?: number; // ECD (lpg)
  remarks?: string; // Texto de observaciones
  image_url?: string; // Ruta relativa al archivo de imagen
  created_at?: Date;
  updated_at?: Date;
}

export interface IUGeomechanicModel extends Model<GeomechanicProject> {}

const lithologySchema = new Schema<LithologyEntry>(
  {
    name: { type: String, required: true },
    present: { type: Boolean, default: false },
  },
  { _id: false }
);

const geomechanicSchema = new Schema<GeomechanicProject, IUGeomechanicModel>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: false },
    section: { type: String, required: true },
    sample_time: { type: Date, default: Date.now },
    hour_24h: { type: String, required: true },
    lag_depth_ft: { type: Number, required: true },
    event: { type: String, default: "" },
    derrumbes: { type: Boolean, default: false },
    morphology_retrab_pct: { type: Number, default: 0 },
    morphology_normal_pct: { type: Number, default: 0 },
    morphology_angular_pct: { type: Number, default: 0 },
    morphology_tabular_pct: { type: Number, default: 0 },
    morphology_astilloso_pct: { type: Number, default: 0 },
    lithologies: { type: [lithologySchema], default: [] },
    // Nuevos campos globales (antes por litología)
    min_mm: { type: Number },
    max_mm: { type: Number },
    avg_mm: { type: Number },
    cuttings_rate_bph: { type: Number },
    excess_deficit_bbl: { type: Number },
    inc_zarandas: { type: String },
    mw_lpg: { type: Number },
    ecd_lpg: { type: Number },
    remarks: { type: String, default: "" },
    image_url: { type: String },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const geomechanicModel = model<GeomechanicProject, IUGeomechanicModel>(
  "GeomechanicProject",
  geomechanicSchema
);

export default geomechanicModel;
