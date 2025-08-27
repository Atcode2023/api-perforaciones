"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paginate_1 = require("../paginate");
const mongoose_1 = require("mongoose");
const projectSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    supervisor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Opcional
    },
    ing_night: {
        type: mongoose_1.Schema.Types.ObjectId,
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
projectSchema.plugin(paginate_1.paginate);
projectSchema.methods.softDelete = async function () {
    if (this.deleted_at)
        return this; // Ya eliminado
    await projectModel.updateOne({ _id: this._id }, { $set: { deleted_at: new Date() } });
    this.deleted_at = new Date();
    return this;
};
const projectModel = (0, mongoose_1.model)("Project", projectSchema);
exports.default = projectModel;
//# sourceMappingURL=proyect.model.js.map