"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProjectStaticDataDto = exports.TotalRcsDto = exports.SurveyKpiDto = exports.ReviewKpiDto = exports.ConexKpiDto = exports.TripRopKpiDto = exports.RopAvgKpiDto = exports.RopEfecKpiDto = exports.CreatePerforationDto = exports.CreateBhaDto = exports.CreateProjectDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateProjectDto {
}
exports.CreateProjectDto = CreateProjectDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateProjectDto.prototype, "customer", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateProjectDto.prototype, "well", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateProjectDto.prototype, "uwi_sidetrack", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateProjectDto.prototype, "equipment", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateProjectDto.prototype, "section", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateProjectDto.prototype, "ing_day", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateProjectDto.prototype, "ing_night", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateProjectDto.prototype, "supervisor", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateProjectDto.prototype, "start_date", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateProjectDto.prototype, "start_time", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateProjectDto.prototype, "entry_depth", void 0);
class CreateBhaDto {
}
exports.CreateBhaDto = CreateBhaDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateBhaDto.prototype, "engine_od", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateBhaDto.prototype, "engine_type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateBhaDto.prototype, "factor", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateBhaDto.prototype, "trepan", void 0);
class CreatePerforationDto {
}
exports.CreatePerforationDto = CreatePerforationDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreatePerforationDto.prototype, "directional_profile_type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreatePerforationDto.prototype, "formation", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreatePerforationDto.prototype, "bha", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "to_time", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreatePerforationDto.prototype, "activity", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "depth_to", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreatePerforationDto.prototype, "tf_type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreatePerforationDto.prototype, "tfo", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "rpm_surface", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "wob", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "caudal", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "tq_bottom", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "tq_out_bottom", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "spp_bottom", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "spp_out_bottom", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "peeg_bottom", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "peeg_out_bottom", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "peeg_rotating", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "mud_density", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreatePerforationDto.prototype, "shift", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "md", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "tvd", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "incl", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "az", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreatePerforationDto.prototype, "comments", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreatePerforationDto.prototype, "pierced_feet_kpi", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreatePerforationDto.prototype, "formations", void 0);
class RopEfecKpiDto {
}
exports.RopEfecKpiDto = RopEfecKpiDto;
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], RopEfecKpiDto.prototype, "depth", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], RopEfecKpiDto.prototype, "rop", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], RopEfecKpiDto.prototype, "_id", void 0);
class RopAvgKpiDto {
}
exports.RopAvgKpiDto = RopAvgKpiDto;
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], RopAvgKpiDto.prototype, "depth", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], RopAvgKpiDto.prototype, "rop", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], RopAvgKpiDto.prototype, "_id", void 0);
class TripRopKpiDto {
}
exports.TripRopKpiDto = TripRopKpiDto;
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], TripRopKpiDto.prototype, "depth", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], TripRopKpiDto.prototype, "rop", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TripRopKpiDto.prototype, "_id", void 0);
class ConexKpiDto {
}
exports.ConexKpiDto = ConexKpiDto;
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], ConexKpiDto.prototype, "depth", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], ConexKpiDto.prototype, "rop", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], ConexKpiDto.prototype, "_id", void 0);
class ReviewKpiDto {
}
exports.ReviewKpiDto = ReviewKpiDto;
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], ReviewKpiDto.prototype, "time", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], ReviewKpiDto.prototype, "_id", void 0);
class SurveyKpiDto {
}
exports.SurveyKpiDto = SurveyKpiDto;
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], SurveyKpiDto.prototype, "time", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], SurveyKpiDto.prototype, "_id", void 0);
class TotalRcsDto {
}
exports.TotalRcsDto = TotalRcsDto;
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], TotalRcsDto.prototype, "time", void 0);
class CreateProjectStaticDataDto {
}
exports.CreateProjectStaticDataDto = CreateProjectStaticDataDto;
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RopEfecKpiDto),
    tslib_1.__metadata("design:type", Array)
], CreateProjectStaticDataDto.prototype, "rop_efec_kpi", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RopAvgKpiDto),
    tslib_1.__metadata("design:type", Array)
], CreateProjectStaticDataDto.prototype, "rop_avg_kpi", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TripRopKpiDto),
    tslib_1.__metadata("design:type", Array)
], CreateProjectStaticDataDto.prototype, "trip_rop_kpi", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ConexKpiDto),
    tslib_1.__metadata("design:type", Array)
], CreateProjectStaticDataDto.prototype, "conex_kpi", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReviewKpiDto),
    tslib_1.__metadata("design:type", Array)
], CreateProjectStaticDataDto.prototype, "review_kpi", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SurveyKpiDto),
    tslib_1.__metadata("design:type", Array)
], CreateProjectStaticDataDto.prototype, "survey_kpi", void 0);
//# sourceMappingURL=project.dto.js.map