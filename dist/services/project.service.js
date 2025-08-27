"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const proyect_model_1 = tslib_1.__importDefault(require("../models/proyect.model"));
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
class ProjectService {
    constructor() {
        this.proyects = proyect_model_1.default;
    }
    async createProject(projectData) {
        if (!projectData)
            throw new Error("Project data is empty");
        // Convertir ing_day e ing_night a ObjectId
        const ingDayId = new mongoose_1.default.Types.ObjectId(projectData.ing_day);
        const ingNightId = new mongoose_1.default.Types.ObjectId(projectData.ing_night);
        const proyect = await this.proyects.create(Object.assign(Object.assign({}, projectData), { ing_day: ingDayId, ing_night: ingNightId, created_at: new Date(), deleted_at: null }));
        return proyect;
    }
    async createBha(projectId, bhaData) {
        if (!projectId || !bhaData)
            throw new Error("Project ID or BHA data is empty");
        const project = await this.proyects.findById(projectId);
        if (!project)
            throw new Error("Project doesn't exist");
        project.bhas.push(bhaData);
        project.has_changes = new Date();
        await project.save();
        return bhaData;
    }
    async createPerforation(projectId, perforationData) {
        if (!projectId || !perforationData)
            throw new Error("Project ID or Perforation data is empty");
        const project = await this.proyects.findById(projectId);
        if (!project)
            throw new Error("Project doesn't exist");
        // Calcular campos
        this.calculatePerforationFields(perforationData, project);
        // Asignar _id si no existe
        if (!perforationData._id) {
            perforationData._id = new mongoose_1.default.Types.ObjectId();
        }
        project.perforations.push(perforationData);
        project.has_changes = new Date();
        await project.save();
        return perforationData;
    }
    async updatePerforation(projectId, perforationId, updateData) {
        const project = await this.proyects.findById(projectId);
        if (!project)
            throw new Error("Project not found");
        const index = project.perforations.findIndex((p) => { var _a; return ((_a = p._id) === null || _a === void 0 ? void 0 : _a.toString()) === perforationId; });
        if (index === -1)
            throw new Error("Perforation not found");
        const perforation = project.perforations[index];
        Object.assign(perforation, updateData);
        // Calcular campos actualizados
        this.calculatePerforationFields(perforation, project);
        // Asegurar que Mongoose detecte cambios en el subdocumento
        project.markModified("perforations");
        project.has_changes = new Date();
        await project.save();
        return perforation;
    }
    async deletePerforation(projectId, perforationId) {
        const project = await this.proyects.findById(projectId);
        if (!project)
            throw new Error("Project not found");
        const index = project.perforations.findIndex((p) => { var _a; return ((_a = p._id) === null || _a === void 0 ? void 0 : _a.toString()) === perforationId; });
        if (index === -1)
            throw new Error("Perforation not found");
        project.perforations.splice(index, 1);
        project.has_changes = new Date();
        await project.save();
        return { _id: perforationId, deleted: true };
    }
    async findAllProjects(filter, options, req) {
        let query = {};
        if (filter && filter.search) {
            const regex = new RegExp(filter.search, "i");
            query.$or = [
                { customer: regex },
                { well: regex },
                { uwi_sidetrack: regex },
                { equipment: regex },
                { section: regex },
            ];
        }
        // Obtener usuario en sesión desde req.user
        const user = req === null || req === void 0 ? void 0 : req.user;
        if (user && user.role === "USER") {
            query.$or = [{ ing_day: user._id }, { ing_night: user._id }];
            // Si hay búsqueda, combinar ambos filtros
            if (filter && filter.search) {
                const regex = new RegExp(filter.search, "i");
                query.$and = [
                    { $or: [{ ing_day: user._id }, { ing_night: user._id }] },
                    {
                        $or: [
                            { customer: regex },
                            { well: regex },
                            { uwi_sidetrack: regex },
                            { equipment: regex },
                            { section: regex },
                        ],
                    },
                ];
                // Eliminar $or de la raíz para evitar conflicto
                delete query.$or;
            }
        }
        else if (user.role === "SUPERVISOR") {
            query.$or = [{ supervisor: user._id }];
            // Si hay búsqueda, combinar ambos filtros
            if (filter && filter.search) {
                const regex = new RegExp(filter.search, "i");
                query.$and = [
                    {
                        $or: [
                            { customer: regex },
                            { well: regex },
                            { uwi_sidetrack: regex },
                            { equipment: regex },
                            { section: regex },
                        ],
                    },
                ];
                // Eliminar $or de la raíz para evitar conflicto
                delete query.$or;
            }
        }
        // Usar paginate y luego populate los campos de usuario
        const projects = await this.proyects.paginate(query, options);
        // Si hay resultados, hacer populate manualmente
        if (projects.results && projects.results.length > 0) {
            const populatedResults = await Promise.all(projects.results.map(async (proj) => {
                return await proyect_model_1.default
                    .findById(proj._id)
                    .populate("ing_day", "username role")
                    .populate("ing_night", "username role")
                    .populate("supervisor", "username role")
                    .lean();
            }));
            projects.results = populatedResults;
        }
        return projects;
    }
    async findProjectById(projectId) {
        if (!projectId)
            throw new Error("Project ID is required");
        // Usar populate para cargar ing_day e ing_night
        const project = await this.proyects
            .findById(projectId)
            .populate("ing_day")
            .populate("ing_night");
        if (!project)
            return null;
        // Calcular KPI performance
        const performance = {};
        // Rotating: sumar drilled_meters y time de perforaciones con activity "Rota"
        const rotatingFt = project.perforations
            .filter((p) => p.activity === "Rota")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.drilled_meters) !== null && _a !== void 0 ? _a : 0); }, 0);
        // Perforated: sumar drilled_meters de todas las perforaciones (para el cálculo de percentage)
        const rotatingHs = project.perforations
            .filter((p) => p.activity === "Rota")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        performance.rotating = {
            title: "Rota Total",
            ft: Number(rotatingFt),
            hs: Number(rotatingHs),
            rop: rotatingHs !== 0 ? Number(rotatingFt / rotatingHs) : 0,
            percentage: 0,
        };
        // Sliding: sumar drilled_meters de perforaciones con activity "Desliza"
        const slidingFt = project.perforations
            .filter((p) => p.activity === "Desliza")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.drilled_meters) !== null && _a !== void 0 ? _a : 0); }, 0);
        const slidingHs = project.perforations
            .filter((p) => p.activity === "Desliza")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        const slidingRop = slidingHs !== 0 ? Number(slidingFt / slidingHs) : 0;
        performance.sliding = {
            title: "Desliza Total",
            ft: Number(slidingFt),
            hs: Number(slidingHs),
            rop: Number(slidingRop),
            percentage: 0,
        };
        const perforatedFt = rotatingFt + slidingFt;
        const perforatedHs = rotatingHs + slidingHs;
        const perforatedRop = perforatedHs !== 0 ? Number(perforatedFt / perforatedHs) : 0;
        performance.perforated = {
            title: "Perforado Total",
            ft: Number(perforatedFt),
            hs: Number(perforatedHs),
            rop: Number(perforatedRop),
            percentage: 0,
        };
        const rotatingPercentage = rotatingFt > 0 ? Number((rotatingFt / perforatedFt) * 100) : 0;
        const slidingPercentage = slidingFt > 0 ? Number((slidingFt / perforatedFt) * 100) : 0;
        performance.rotating.percentage = Number(rotatingPercentage);
        performance.sliding.percentage = Number(slidingPercentage);
        const byFilterFt = project.perforations.reduce((sum, p) => {
            var _a;
            sum + ((_a = p.footage) !== null && _a !== void 0 ? _a : 0);
        }, 0);
        const byFilterHs = project.perforations.reduce((sum, p) => {
            var _a;
            sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0);
        }, 0);
        const byFilterRop = byFilterHs !== 0 ? Number(byFilterFt / byFilterHs) : 0;
        performance.by_filter = {
            title: "Por Filtro",
            ft: Number(byFilterFt),
            hs: Number(byFilterHs),
            rop: Number(byFilterRop),
            percentage: 0,
        };
        const averageFt = rotatingFt + slidingFt;
        const averageHs = project.perforations
            .filter((p) => ["Rota", "Desliza", "Survey", "Conexión", "Repasa"].includes(p.activity))
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        const averageRop = averageHs !== 0 ? Number(averageFt / averageHs) : 0;
        performance.average = {
            title: "Promedio",
            ft: Number(averageFt),
            hs: Number(averageHs),
            rop: Number(averageRop),
            percentage: 0,
        };
        const slidingDayFt = project.perforations
            .filter((p) => p.activity === "Desliza" && p.shift == "Día")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.drilled_meters) !== null && _a !== void 0 ? _a : 0); }, 0);
        const slidingDayHs = project.perforations
            .filter((p) => p.activity === "Desliza" && p.shift == "Día")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        const slidingDayRop = slidingDayHs !== 0 ? Number(slidingDayFt / slidingDayHs) : 0;
        performance.sliding_day = {
            title: "Desliza Día",
            ft: Number(slidingDayFt),
            hs: Number(slidingDayHs),
            rop: Number(slidingDayRop),
            percentage: 0,
        };
        const slidingNightFt = project.perforations
            .filter((p) => p.activity === "Desliza" && p.shift == "Noche")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.drilled_meters) !== null && _a !== void 0 ? _a : 0); }, 0);
        const slidingNightHs = project.perforations
            .filter((p) => p.activity === "Desliza" && p.shift == "Noche")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        const slidingNightRop = slidingNightHs !== 0 ? Number(slidingNightFt / slidingNightHs) : 0;
        performance.sliding_night = {
            title: "Desliza Noche",
            ft: Number(slidingNightFt),
            hs: Number(slidingNightHs),
            rop: Number(slidingNightRop),
            percentage: 0,
        };
        // Rota Día
        const rotatingDayFt = project.perforations
            .filter((p) => p.activity === "Rota" && p.shift == "Día")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.drilled_meters) !== null && _a !== void 0 ? _a : 0); }, 0);
        const rotatingDayHs = project.perforations
            .filter((p) => p.activity === "Rota" && p.shift == "Día")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        const rotatingDayRop = rotatingDayHs !== 0 ? Number(rotatingDayFt / rotatingDayHs) : 0;
        performance.rotating_day = {
            title: "Rota Día",
            ft: Number(rotatingDayFt),
            hs: Number(rotatingDayHs),
            rop: Number(rotatingDayRop),
            percentage: 0,
        };
        // Rota Noche
        const rotatingNightFt = project.perforations
            .filter((p) => p.activity === "Rota" && p.shift == "Noche")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.drilled_meters) !== null && _a !== void 0 ? _a : 0); }, 0);
        const rotatingNightHs = project.perforations
            .filter((p) => p.activity === "Rota" && p.shift == "Noche")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        const rotatingNightRop = rotatingNightHs !== 0 ? Number(rotatingNightFt / rotatingNightHs) : 0;
        performance.rotating_night = {
            title: "Rota Noche",
            ft: Number(rotatingNightFt),
            hs: Number(rotatingNightHs),
            rop: Number(rotatingNightRop),
            percentage: 0,
        };
        // Calcular Informacion de Tiempos
        const time_information = {};
        const drillingTime = project.perforations
            .filter((p) => p.activity === "Rota" || p.activity === "Desliza")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        time_information.drilling_time = {
            title: "Tiempo de Perforación",
            hs: Number(drillingTime),
        };
        const rotatingTime = project.perforations
            .filter((p) => p.activity === "Rota")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        time_information.rotating_time = {
            title: "Tiempo de Rota",
            hs: Number(rotatingTime),
        };
        const slidingTime = project.perforations
            .filter((p) => p.activity === "Desliza")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        time_information.sliding_time = {
            title: "Tiempo de Desliza",
            hs: Number(slidingTime),
        };
        const drivingTime = project.perforations
            .filter((p) => [
            "Circula",
            "Orienta TF",
            "Survey",
            "Repasa",
            "Perfora cemento",
            "Comando",
            "Geonavegación",
        ].includes(p.activity))
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        time_information.driving_time = {
            title: "Tiempo de Circulación",
            hs: Number(drivingTime),
        };
        const pumpingTime = rotatingTime + slidingTime + drivingTime;
        time_information.pumping_time = {
            title: "Horas Bombeo",
            hs: Number(pumpingTime),
        };
        const conexOthersTime = project.perforations
            .filter((p) => [
            "Conexión",
            "Arma BHA",
            "Desarma BHA",
            "Otros",
            "Calibra",
            "POOH CSG",
            "POOH OH",
            "RIH OH",
            "RIH CSG",
        ].includes(p.activity))
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        time_information.conex_others = {
            title: "Tiempo de Conexiones y Otros",
            hs: Number(conexOthersTime),
        };
        // Calcular parametros
        const parameters = {};
        const wobMin = project.perforations
            .filter((p) => p.wob !== undefined)
            .reduce((min, p) => Math.min(min, p.wob), Infinity);
        const wobMax = project.perforations
            .filter((p) => p.wob !== undefined)
            .reduce((max, p) => Math.max(max, p.wob), -Infinity);
        const wobValues = project.perforations
            .filter((p) => p.wob !== undefined)
            .map((p) => p.wob);
        const wobAverage = wobValues.length > 0
            ? Number(wobValues.reduce((sum, w) => sum + w, 0) /
                wobValues.length)
            : 0;
        parameters.wob = {
            title: "WOB - Ton",
            min: wobMin === Infinity ? 0 : Number(wobMin),
            max: wobMax === -Infinity ? 0 : Number(wobMax),
            average: wobAverage,
        };
        const caudalMin = project.perforations
            .filter((p) => p.caudal !== undefined)
            .reduce((min, p) => Math.min(min, p.caudal), Infinity);
        const caudalMax = project.perforations
            .filter((p) => p.caudal !== undefined)
            .reduce((max, p) => Math.max(max, p.caudal), -Infinity);
        const caudalValues = project.perforations
            .filter((p) => p.caudal !== undefined)
            .map((p) => p.caudal);
        const caudalAverage = caudalValues.length > 0
            ? Number(caudalValues.reduce((sum, c) => sum + c, 0) /
                caudalValues.length)
            : 0;
        parameters.caudal = {
            title: "Caudal - QPM",
            min: caudalMin === Infinity ? 0 : Number(caudalMin),
            max: caudalMax === -Infinity ? 0 : Number(caudalMax),
            average: caudalAverage,
        };
        const diffPressureMin = project.perforations
            .filter((p) => p.differential_pressure !== undefined)
            .reduce((min, p) => Math.min(min, p.differential_pressure), Infinity);
        const diffPressureMax = project.perforations
            .filter((p) => p.differential_pressure !== undefined)
            .reduce((max, p) => Math.max(max, p.differential_pressure), -Infinity);
        const diffPressureValues = project.perforations
            .filter((p) => p.differential_pressure !== undefined)
            .map((p) => p.differential_pressure);
        const diffPressureAverage = diffPressureValues.length > 0
            ? Number(diffPressureValues.reduce((sum, d) => sum + d, 0) /
                diffPressureValues.length)
            : 0;
        parameters.differential_pressure = {
            title: "Presión Diferencial - PSI",
            min: diffPressureMin === Infinity ? 0 : Number(diffPressureMin),
            max: diffPressureMax === -Infinity ? 0 : Number(diffPressureMax),
            average: diffPressureAverage,
        };
        // SPP Bottom
        const sppBottomMin = project.perforations
            .filter((p) => p.spp_bottom !== undefined)
            .reduce((min, p) => Math.min(min, p.spp_bottom), Infinity);
        const sppBottomMax = project.perforations
            .filter((p) => p.spp_bottom !== undefined)
            .reduce((max, p) => Math.max(max, p.spp_bottom), -Infinity);
        const sppBottomValues = project.perforations
            .filter((p) => p.spp_bottom !== undefined)
            .map((p) => p.spp_bottom);
        const sppBottomAverage = sppBottomValues.length > 0
            ? Number(sppBottomValues.reduce((sum, v) => sum + v, 0) /
                sppBottomValues.length)
            : 0;
        parameters.spp_bottom = {
            title: "SPP Bottom - PSI",
            min: sppBottomMin === Infinity ? 0 : Number(sppBottomMin),
            max: sppBottomMax === -Infinity ? 0 : Number(sppBottomMax),
            average: sppBottomAverage,
        };
        // SPP Out Bottom
        const sppOutBottomMin = project.perforations
            .filter((p) => p.spp_out_bottom !== undefined)
            .reduce((min, p) => Math.min(min, p.spp_out_bottom), Infinity);
        const sppOutBottomMax = project.perforations
            .filter((p) => p.spp_out_bottom !== undefined)
            .reduce((max, p) => Math.max(max, p.spp_out_bottom), -Infinity);
        const sppOutBottomValues = project.perforations
            .filter((p) => p.spp_out_bottom !== undefined)
            .map((p) => p.spp_out_bottom);
        const sppOutBottomAverage = sppOutBottomValues.length > 0
            ? Number(sppOutBottomValues.reduce((sum, v) => sum + v, 0) /
                sppOutBottomValues.length)
            : 0;
        parameters.spp_out_bottom = {
            title: "SPP Out Bottom - PSI",
            min: sppOutBottomMin === Infinity ? 0 : Number(sppOutBottomMin),
            max: sppOutBottomMax === -Infinity ? 0 : Number(sppOutBottomMax),
            average: sppOutBottomAverage,
        };
        // TQ Bottom
        const tqBottomMin = project.perforations
            .filter((p) => p.tq_bottom !== undefined)
            .reduce((min, p) => Math.min(min, p.tq_bottom), Infinity);
        const tqBottomMax = project.perforations
            .filter((p) => p.tq_bottom !== undefined)
            .reduce((max, p) => Math.max(max, p.tq_bottom), -Infinity);
        const tqBottomValues = project.perforations
            .filter((p) => p.tq_bottom !== undefined)
            .map((p) => p.tq_bottom);
        const tqBottomAverage = tqBottomValues.length > 0
            ? Number(tqBottomValues.reduce((sum, v) => sum + v, 0) /
                tqBottomValues.length)
            : 0;
        parameters.tq_bottom = {
            title: "TQ Bottom - ft-lb",
            min: tqBottomMin === Infinity ? 0 : Number(tqBottomMin),
            max: tqBottomMax === -Infinity ? 0 : Number(tqBottomMax),
            average: tqBottomAverage,
        };
        // TQ Out Bottom
        const tqOutBottomMin = project.perforations
            .filter((p) => p.tq_out_bottom !== undefined)
            .reduce((min, p) => Math.min(min, p.tq_out_bottom), Infinity);
        const tqOutBottomMax = project.perforations
            .filter((p) => p.tq_out_bottom !== undefined)
            .reduce((max, p) => Math.max(max, p.tq_out_bottom), -Infinity);
        const tqOutBottomValues = project.perforations
            .filter((p) => p.tq_out_bottom !== undefined)
            .map((p) => p.tq_out_bottom);
        const tqOutBottomAverage = tqOutBottomValues.length > 0
            ? Number(tqOutBottomValues.reduce((sum, v) => sum + v, 0) /
                tqOutBottomValues.length)
            : 0;
        parameters.tq_out_bottom = {
            title: "TQ Out Bottom - ft-lb",
            min: tqOutBottomMin === Infinity ? 0 : Number(tqOutBottomMin),
            max: tqOutBottomMax === -Infinity ? 0 : Number(tqOutBottomMax),
            average: tqOutBottomAverage,
        };
        // Total RPM
        const totalRpmMin = project.perforations
            .filter((p) => p.total_rpm !== undefined)
            .reduce((min, p) => Math.min(min, p.total_rpm), Infinity);
        const totalRpmMax = project.perforations
            .filter((p) => p.total_rpm !== undefined)
            .reduce((max, p) => Math.max(max, p.total_rpm), -Infinity);
        const totalRpmValues = project.perforations
            .filter((p) => p.total_rpm !== undefined)
            .map((p) => p.total_rpm);
        const totalRpmAverage = totalRpmValues.length > 0
            ? Number(totalRpmValues.reduce((sum, v) => sum + v, 0) /
                totalRpmValues.length)
            : 0;
        parameters.total_rpm = {
            title: "Total RPM",
            min: totalRpmMin === Infinity ? 0 : Number(totalRpmMin),
            max: totalRpmMax === -Infinity ? 0 : Number(totalRpmMax),
            average: totalRpmAverage,
        };
        // Calcular Survey Time
        const surveyTime = project.perforations
            .filter((p) => p.activity === "Survey")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        // Calcular Viajes
        const trips = {};
        const rihCsgSum = project.perforations
            .filter((p) => p.activity === "RIH CSG")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.drilled_meters) !== null && _a !== void 0 ? _a : 0); }, 0);
        const rihCsgTimeSum = project.perforations
            .filter((p) => p.activity === "RIH CSG")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        trips.rih_csg = {
            title: "RIH CSG",
            ft_hs: rihCsgTimeSum !== 0 ? Number(rihCsgSum / rihCsgTimeSum) : 0,
        };
        const rihOhSum = project.perforations
            .filter((p) => p.activity === "RIH OH")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.drilled_meters) !== null && _a !== void 0 ? _a : 0); }, 0);
        const rihOhTimeSum = project.perforations
            .filter((p) => p.activity === "RIH OH")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        trips.rih_oh = {
            title: "RIH OH",
            ft_hs: rihOhTimeSum !== 0 ? Number(rihOhSum / rihOhTimeSum) : 0,
        };
        const poohCsgSum = project.perforations
            .filter((p) => p.activity === "POOH CSG")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.drilled_meters) !== null && _a !== void 0 ? _a : 0); }, 0);
        const poohCsgTimeSum = project.perforations
            .filter((p) => p.activity === "POOH CSG")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        trips.pooh_csg = {
            title: "POOH CSG",
            ft_hs: poohCsgTimeSum !== 0 ? Number(poohCsgSum / poohCsgTimeSum) : 0,
        };
        const poohOhSum = project.perforations
            .filter((p) => p.activity === "POOH OH")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.drilled_meters) !== null && _a !== void 0 ? _a : 0); }, 0);
        const poohOhTimeSum = project.perforations
            .filter((p) => p.activity === "POOH OH")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        trips.pooh_oh = {
            title: "POOH OH",
            ft_hs: poohOhTimeSum !== 0 ? Number(poohOhSum / poohOhTimeSum) : 0,
        };
        // Calcular Conexiones
        const conex_time = {};
        const conexDaySum = project.perforations
            .filter((p) => p.activity === "Conexión" && p.shift === "Día")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        const conexDayCount = project.perforations.filter((p) => p.activity === "Conexión" && p.shift === "Día").length;
        conex_time.day = {
            title: "Día",
            count: conexDayCount,
            hs: Number(conexDaySum),
        };
        const conexNightSum = project.perforations
            .filter((p) => p.activity === "Conexión" && p.shift === "Noche")
            .reduce((sum, p) => { var _a; return sum + ((_a = p.time) !== null && _a !== void 0 ? _a : 0); }, 0);
        const conexNightCount = project.perforations.filter((p) => p.activity === "Conexión" && p.shift === "Noche").length;
        conex_time.night = {
            title: "Noche",
            count: conexNightCount,
            hs: Number(conexNightSum),
        };
        conex_time.total = {
            title: "Total",
            count: conexDayCount + conexNightCount,
            hs: Number(conexDaySum + conexNightSum),
        };
        // Puedes devolver el KPI junto con el proyecto
        return Object.assign(Object.assign({}, project.toObject()), { kpi: {
                performance,
                time_information,
                parameters,
                survey_time: {
                    title: "Tiempo de Survey",
                    hs: Number(surveyTime.toFixed(2)),
                },
                trips,
                conex_time,
            } });
    }
    async createProjectStaticData(projectId, staticData) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        const project = await proyect_model_1.default.findById(projectId);
        if (!project)
            throw new Error("Proyecto no encontrado");
        // Calcular total_rcs sumando rop de conex_kpi, time de review_kpi y time de survey_kpi por posición
        const totalLength = Math.max((_b = (_a = staticData.conex_kpi) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0, (_d = (_c = staticData.review_kpi) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0, (_f = (_e = staticData.survey_kpi) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0);
        const total_rcs = [];
        for (let i = 0; i < totalLength; i++) {
            const rop = (_j = (_h = (_g = staticData.conex_kpi) === null || _g === void 0 ? void 0 : _g[i]) === null || _h === void 0 ? void 0 : _h.rop) !== null && _j !== void 0 ? _j : 0;
            const reviewTime = (_m = (_l = (_k = staticData.review_kpi) === null || _k === void 0 ? void 0 : _k[i]) === null || _l === void 0 ? void 0 : _l.time) !== null && _m !== void 0 ? _m : 0;
            const surveyTime = (_q = (_p = (_o = staticData.survey_kpi) === null || _o === void 0 ? void 0 : _o[i]) === null || _p === void 0 ? void 0 : _p.time) !== null && _q !== void 0 ? _q : 0;
            total_rcs.push({ time: rop + reviewTime + surveyTime });
        }
        staticData.total_rcs = total_rcs;
        project.project_static_data = staticData;
        project.has_changes = new Date();
        await project.save();
        return project.project_static_data;
    }
    calculatePerforationFields(perforationData, project) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        // Calcular created_at y from_time
        if (!perforationData.created_at) {
            perforationData.created_at = new Date();
        }
        const date = new Date(perforationData.created_at);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const from_time = hours + minutes / 60;
        perforationData.from_time = Number(from_time.toFixed(2));
        perforationData.time = Number(Math.abs(from_time - perforationData.to_time).toFixed(2));
        // Calcular depth_from del último perforation
        const perforations = project.perforations;
        if (perforations.length > 1) {
            // Si viene _id, buscar la perforación anterior a ese _id
            if (perforationData._id) {
                const idx = perforations.findIndex((p) => { var _a, _b; return ((_a = p._id) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = perforationData._id) === null || _b === void 0 ? void 0 : _b.toString()); });
                if (idx != -1) {
                    perforationData.depth_from = (_a = perforations[idx - 1].depth_to) !== null && _a !== void 0 ? _a : 0;
                }
                else {
                    perforationData.depth_from = (_b = project.entry_depth) !== null && _b !== void 0 ? _b : 0;
                }
            }
            else {
                const lastPerforation = perforations[perforations.length - 1];
                perforationData.depth_from = (_c = lastPerforation.depth_to) !== null && _c !== void 0 ? _c : 0;
            }
        }
        else {
            perforationData.depth_from = (_d = project.entry_depth) !== null && _d !== void 0 ? _d : 0;
        }
        // Calcular circulates_out_of_background
        perforationData.circulates_out_of_background =
            perforationData.activity === "Circula" ? perforationData.time : 0;
        // Calcular drilled_meters con 2 decimales
        perforationData.drilled_meters = Number((perforationData.depth_to - perforationData.depth_from).toFixed(2));
        // Calcular effective_rop solo si activity es 'Rota' o 'Desliza', 2 decimales
        if (perforationData.activity === "Rota" ||
            perforationData.activity === "Desliza") {
            perforationData.effective_rop =
                perforationData.time !== 0
                    ? Number((perforationData.drilled_meters / perforationData.time).toFixed(2))
                    : 0;
        }
        else {
            perforationData.effective_rop = 0;
        }
        // Calcular total_rpm con 2 decimales
        if (perforationData.activity === "Comentario") {
            perforationData.total_rpm = 0;
        }
        else if (!perforationData.bha) {
            perforationData.total_rpm = 0;
        }
        else if (!perforationData.caudal || perforationData.caudal <= 0) {
            perforationData.total_rpm = Number((_f = (_e = perforationData.rpm_surface) === null || _e === void 0 ? void 0 : _e.toFixed(2)) !== null && _f !== void 0 ? _f : 0);
        }
        else {
            const bhaSelected = project.bhas.find((bha) => { var _a, _b; return ((_a = bha._id) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = perforationData.bha) === null || _b === void 0 ? void 0 : _b.toString()); });
            const factor = (_g = bhaSelected === null || bhaSelected === void 0 ? void 0 : bhaSelected.factor) !== null && _g !== void 0 ? _g : 0;
            perforationData.total_rpm = Number((perforationData.rpm_surface + factor).toFixed(2));
        }
        // Calcular differential_pressure con 2 decimales
        perforationData.differential_pressure = Number(Math.abs(((_h = perforationData.spp_bottom) !== null && _h !== void 0 ? _h : 0) -
            ((_j = perforationData.spp_out_bottom) !== null && _j !== void 0 ? _j : 0)).toFixed(2));
        // Calcular rop_kpi usando rop_efec_kpi de project_static_data
        if ((perforationData.activity === "Rota" ||
            perforationData.activity === "Desliza") &&
            perforationData.depth_from &&
            perforationData.depth_to &&
            perforationData.depth_from > 0 &&
            perforationData.depth_to > 0 &&
            project.project_static_data &&
            Array.isArray(project.project_static_data.rop_efec_kpi)) {
            // Buscar el rango donde depth_from esté entre depth[i] y depth[i+1]
            const ropKpiArr = project.project_static_data.rop_efec_kpi;
            let ropValue = 0;
            for (let i = 0; i < ropKpiArr.length; i++) {
                const curr = ropKpiArr[i];
                const next = ropKpiArr[i + 1];
                if (next &&
                    perforationData.depth_from >= curr.depth &&
                    perforationData.depth_from < next.depth) {
                    ropValue = curr.rop;
                    break;
                }
                // Si es el último rango y depth_from es mayor o igual
                if (!next && perforationData.depth_from >= curr.depth) {
                    ropValue = curr.rop;
                    break;
                }
            }
            perforationData.rop_kpi = Number(ropValue.toFixed(2));
        }
        else {
            perforationData.rop_kpi = 0;
        }
        // Calcular rop_efe_kpi usando rop_avg_kpi de project_static_data
        const validActivitiesEfe = [
            "Rota",
            "Desliza",
            "Conexión",
            "Survey",
            "Extraordinario",
        ];
        if (validActivitiesEfe.includes(perforationData.activity) &&
            perforationData.depth_from !== undefined &&
            perforationData.depth_to !== undefined &&
            perforationData.depth_from !== 0 &&
            perforationData.depth_to !== 0 &&
            perforationData.depth_from !== perforationData.depth_to &&
            project.project_static_data &&
            Array.isArray(project.project_static_data.rop_avg_kpi)) {
            const ropAvgArr = project.project_static_data.rop_avg_kpi;
            let ropEfeValue = 0;
            for (let i = 0; i < ropAvgArr.length; i++) {
                const curr = ropAvgArr[i];
                const next = ropAvgArr[i + 1];
                if (next &&
                    perforationData.depth_from >= curr.depth &&
                    perforationData.depth_from < next.depth) {
                    ropEfeValue = curr.rop;
                    break;
                }
                if (!next && perforationData.depth_from >= curr.depth) {
                    ropEfeValue = curr.rop;
                    break;
                }
            }
            perforationData.rop_efe_kpi = Number(ropEfeValue.toFixed(2));
        }
        else {
            perforationData.rop_efe_kpi = 0;
        }
        // Calcular footage
        if (perforationData.activity === "Rota" ||
            perforationData.activity === "Desliza") {
            perforationData.footage = perforationData.drilled_meters;
        }
        else {
            perforationData.footage = 0;
        }
        // Calcular rop_avg según la fórmula (footage / time si footage > 0)
        if (perforationData.footage > 0 && perforationData.time) {
            perforationData.rop_avg = Number((perforationData.footage / perforationData.time).toFixed(2));
        }
        else {
            perforationData.rop_avg = 0;
        }
        // Calcular rop_trips con 2 decimales
        const validActivities = ["RIH CSG", "RIH OH", "POOH CSG", "POOH OH"];
        if (validActivities.includes(perforationData.activity) &&
            perforationData.depth_from !== undefined &&
            perforationData.depth_to !== undefined &&
            perforationData.depth_from !== perforationData.depth_to &&
            perforationData.drilled_meters !== undefined &&
            perforationData.time) {
            perforationData.rop_trips = Number(Math.abs(perforationData.drilled_meters / perforationData.time).toFixed(2));
        }
        else {
            perforationData.rop_trips = 0;
        }
    }
    /**
     * Prepara la data para gráficas del proyecto.
     * Por ahora incluye la data para pie chart de actividades, pero está listo para agregar más.
     */
    async ReportProject(projectId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12;
        if (!projectId)
            throw new Error("Project ID is required");
        const project = await this.proyects.findById(projectId);
        if (!project)
            throw new Error("Project not found");
        // Pie chart: Agrupar tiempos por actividad
        const activityTimes = {};
        for (const p of project.perforations) {
            if (!p.activity || typeof p.time !== "number")
                continue;
            activityTimes[p.activity] = ((_a = activityTimes[p.activity]) !== null && _a !== void 0 ? _a : 0) + p.time;
        }
        const totalTime = Object.values(activityTimes).reduce((sum, t) => sum + t, 0);
        const labels = [];
        const data = [];
        const percentages = [];
        const raw = [];
        for (const [activity, time] of Object.entries(activityTimes)) {
            labels.push(activity);
            data.push(Number(time.toFixed(2)));
            const percent = totalTime > 0 ? Number(((time / totalTime) * 100).toFixed(2)) : 0;
            percentages.push(percent);
            raw.push({
                activity,
                time: Number(time.toFixed(2)),
                percentage: percent,
            });
        }
        // Nueva gráfica: Pies Perforados Plan vs Real
        // Filtrar perforaciones con activity 'Rota' o 'Desliza'
        const filtered = project.perforations.filter((p) => p.activity === "Rota" || p.activity === "Desliza");
        // Agrupar por fecha (solo YYYY-MM-DD)
        const groupByDate = {};
        for (const p of filtered) {
            if (!p.created_at)
                continue;
            const date = new Date(p.created_at);
            // Formato YYYY-MM-DD
            const dateStr = date.toISOString().slice(0, 10);
            if (!groupByDate[dateStr]) {
                groupByDate[dateStr] = { planned: 0, real: 0 };
            }
            groupByDate[dateStr].planned += Number((_b = p.pierced_feet_kpi) !== null && _b !== void 0 ? _b : 0);
            groupByDate[dateStr].real += Number((_c = p.drilled_meters) !== null && _c !== void 0 ? _c : 0);
        }
        const drilledFeetLabels = [];
        const drilledFeetPlanned = [];
        const drilledFeetReal = [];
        const drilledFeetRaw = [];
        for (const date of Object.keys(groupByDate).sort()) {
            drilledFeetLabels.push(date);
            drilledFeetPlanned.push(Number(groupByDate[date].planned.toFixed(2)));
            drilledFeetReal.push(Number(groupByDate[date].real.toFixed(2)));
            drilledFeetRaw.push({
                date,
                planned: Number(groupByDate[date].planned.toFixed(2)),
                real: Number(groupByDate[date].real.toFixed(2)),
            });
        }
        // Nueva gráfica: Pies Perforados Día
        const filteredDay = project.perforations.filter((p) => (p.activity === "Rota" || p.activity === "Desliza") && p.shift === "Día");
        const groupByDateDay = {};
        for (const p of filteredDay) {
            if (!p.created_at)
                continue;
            const dateStr = new Date(p.created_at).toISOString().slice(0, 10);
            if (!groupByDateDay[dateStr]) {
                groupByDateDay[dateStr] = { planned: 0, real: 0 };
            }
            groupByDateDay[dateStr].planned += Number((_d = p.pierced_feet_kpi) !== null && _d !== void 0 ? _d : 0);
            groupByDateDay[dateStr].real += Number((_e = p.drilled_meters) !== null && _e !== void 0 ? _e : 0);
        }
        const drilledFeetDayLabels = [];
        const drilledFeetDayPlanned = [];
        const drilledFeetDayReal = [];
        const drilledFeetDayRaw = [];
        for (const date of Object.keys(groupByDateDay).sort()) {
            drilledFeetDayLabels.push(date);
            drilledFeetDayPlanned.push(Number(groupByDateDay[date].planned.toFixed(2)));
            drilledFeetDayReal.push(Number(groupByDateDay[date].real.toFixed(2)));
            drilledFeetDayRaw.push({
                date,
                planned: Number(groupByDateDay[date].planned.toFixed(2)),
                real: Number(groupByDateDay[date].real.toFixed(2)),
            });
        }
        // Nueva gráfica: Pies Perforados Noche
        const filteredNight = project.perforations.filter((p) => (p.activity === "Rota" || p.activity === "Desliza") &&
            p.shift === "Noche");
        const groupByDateNight = {};
        for (const p of filteredNight) {
            if (!p.created_at)
                continue;
            const dateStr = new Date(p.created_at).toISOString().slice(0, 10);
            if (!groupByDateNight[dateStr]) {
                groupByDateNight[dateStr] = { planned: 0, real: 0 };
            }
            groupByDateNight[dateStr].planned += Number((_f = p.pierced_feet_kpi) !== null && _f !== void 0 ? _f : 0);
            groupByDateNight[dateStr].real += Number((_g = p.drilled_meters) !== null && _g !== void 0 ? _g : 0);
        }
        const drilledFeetNightLabels = [];
        const drilledFeetNightPlanned = [];
        const drilledFeetNightReal = [];
        const drilledFeetNightRaw = [];
        for (const date of Object.keys(groupByDateNight).sort()) {
            drilledFeetNightLabels.push(date);
            drilledFeetNightPlanned.push(Number(groupByDateNight[date].planned.toFixed(2)));
            drilledFeetNightReal.push(Number(groupByDateNight[date].real.toFixed(2)));
            drilledFeetNightRaw.push({
                date,
                planned: Number(groupByDateNight[date].planned.toFixed(2)),
                real: Number(groupByDateNight[date].real.toFixed(2)),
            });
        }
        // --- ROP PROMEDIO POR FECHA ---
        // Filtrar perforaciones válidas
        const ropFiltered = project.perforations.filter((p) => (p.activity === "Rota" || p.activity === "Desliza") && p.created_at);
        // Agrupar por fecha
        const ropGroupByDate = {};
        for (const p of ropFiltered) {
            const dateStr = new Date(p.created_at).toISOString().slice(0, 10);
            if (!ropGroupByDate[dateStr]) {
                ropGroupByDate[dateStr] = { totalFeet: 0, totalTime: 0 };
            }
            ropGroupByDate[dateStr].totalFeet += Number((_h = p.drilled_meters) !== null && _h !== void 0 ? _h : 0);
            ropGroupByDate[dateStr].totalTime += Number((_j = p.time) !== null && _j !== void 0 ? _j : 0);
        }
        // Calcular ROP real y planeado por fecha
        const ropAvgLabels = [];
        const ropAvgReal = [];
        const ropAvgPlanned = [];
        const ropAvgRaw = [];
        // Helper para buscar el rop planeado en el rango de rop_avg_kpi
        function getPlannedRop(depth) {
            var _a, _b;
            const arr = (_b = (_a = project.project_static_data) === null || _a === void 0 ? void 0 : _a.rop_avg_kpi) !== null && _b !== void 0 ? _b : [];
            let ropValue = 0;
            for (let i = 0; i < arr.length; i++) {
                const curr = arr[i];
                const next = arr[i + 1];
                if (next && depth >= curr.depth && depth < next.depth) {
                    ropValue = curr.rop;
                    break;
                }
                if (!next && depth >= curr.depth) {
                    ropValue = curr.rop;
                    break;
                }
            }
            return Number(ropValue.toFixed(2));
        }
        for (const date of Object.keys(ropGroupByDate).sort()) {
            const { totalFeet, totalTime } = ropGroupByDate[date];
            const real = totalTime > 0 ? Number((totalFeet / totalTime).toFixed(2)) : 0;
            const planned = totalFeet > 0 ? getPlannedRop(totalFeet) : 0;
            ropAvgLabels.push(date);
            ropAvgReal.push(real);
            ropAvgPlanned.push(planned);
            ropAvgRaw.push({ date, planned, real });
        }
        // --- ROP ROTADO POR TURNOS ---
        // Filtrar perforaciones válidas (solo "Rota")
        const rotaFiltered = project.perforations.filter((p) => p.activity === "Rota" && p.created_at);
        // Agrupar por fecha y turno
        const rotaGroupByDate = {};
        for (const p of rotaFiltered) {
            const dateStr = new Date(p.created_at).toISOString().slice(0, 10);
            if (!rotaGroupByDate[dateStr]) {
                rotaGroupByDate[dateStr] = {
                    dayFeet: 0,
                    dayTime: 0,
                    nightFeet: 0,
                    nightTime: 0,
                };
            }
            if (p.shift === "Día") {
                rotaGroupByDate[dateStr].dayFeet += Number((_k = p.drilled_meters) !== null && _k !== void 0 ? _k : 0);
                rotaGroupByDate[dateStr].dayTime += Number((_l = p.time) !== null && _l !== void 0 ? _l : 0);
            }
            else if (p.shift === "Noche") {
                rotaGroupByDate[dateStr].nightFeet += Number((_m = p.drilled_meters) !== null && _m !== void 0 ? _m : 0);
                rotaGroupByDate[dateStr].nightTime += Number((_o = p.time) !== null && _o !== void 0 ? _o : 0);
            }
        }
        const ropRotatedLabels = [];
        const ropRotatedDay = [];
        const ropRotatedNight = [];
        const ropRotatedKpi = [];
        const ropRotatedRaw = [];
        for (const date of Object.keys(rotaGroupByDate).sort()) {
            const { dayFeet, dayTime, nightFeet, nightTime } = rotaGroupByDate[date];
            const ropDay = dayTime > 0 ? Number((dayFeet / dayTime).toFixed(2)) : 0;
            const ropNight = nightTime > 0 ? Number((nightFeet / nightTime).toFixed(2)) : 0;
            const totalFeet = dayFeet + nightFeet;
            const ropKpi = totalFeet > 0 ? getPlannedRop(totalFeet) : 0;
            ropRotatedLabels.push(date);
            ropRotatedDay.push(ropDay);
            ropRotatedNight.push(ropNight);
            ropRotatedKpi.push(ropKpi);
            ropRotatedRaw.push({ date, ropDay, ropNight, ropKpi });
        }
        // --- TIEMPOS DE REPASO POR TURNO ---
        const reviewFiltered = await project.perforations
            .filter((p) => p.activity == "Repasa")
            .map((p, idx) => (Object.assign(Object.assign({}, p._doc), { index: idx + 1 })));
        const reviewLabels = [];
        const reviewTime = [];
        const reviewDay = [];
        const reviewNight = [];
        const reviewKpi = [];
        const reviewRaw = [];
        const reviewKpiValue = (_s = (_r = (_q = (_p = project.project_static_data) === null || _p === void 0 ? void 0 : _p.review_kpi) === null || _q === void 0 ? void 0 : _q[0]) === null || _r === void 0 ? void 0 : _r.time) !== null && _s !== void 0 ? _s : 0;
        for (const p of reviewFiltered) {
            reviewLabels.push(p.index);
            reviewTime.push(Number((_t = p.time) !== null && _t !== void 0 ? _t : 0));
            if (p.shift === "Día") {
                reviewDay.push(Number((_u = p.time) !== null && _u !== void 0 ? _u : 0));
                reviewNight.push(0);
            }
            else if (p.shift === "Noche") {
                reviewDay.push(0);
                reviewNight.push(Number((_v = p.time) !== null && _v !== void 0 ? _v : 0));
            }
            else {
                reviewDay.push(0);
                reviewNight.push(0);
            }
            reviewKpi.push(Number(reviewKpiValue));
            reviewRaw.push({
                index: p.index,
                time: Number((_w = p.time) !== null && _w !== void 0 ? _w : 0),
                shift: (_x = p.shift) !== null && _x !== void 0 ? _x : "",
                kpi: Number(reviewKpiValue),
            });
        }
        // --- TIEMPOS DE SURVEY POR TURNO ---
        const surveyFiltered = await project.perforations
            .filter((p) => p.activity == "Survey")
            .map((p, idx) => (Object.assign(Object.assign({}, p._doc), { index: idx + 1 })));
        const surveyLabels = [];
        const surveyTime = [];
        const surveyDay = [];
        const surveyNight = [];
        const surveyKpi = [];
        const surveyRaw = [];
        const surveyKpiValue = (_1 = (_0 = (_z = (_y = project.project_static_data) === null || _y === void 0 ? void 0 : _y.survey_kpi) === null || _z === void 0 ? void 0 : _z[0]) === null || _0 === void 0 ? void 0 : _0.time) !== null && _1 !== void 0 ? _1 : 0;
        for (const p of surveyFiltered) {
            surveyLabels.push(p.index);
            surveyTime.push(Number((_2 = p.time) !== null && _2 !== void 0 ? _2 : 0));
            if (p.shift === "Día") {
                surveyDay.push(Number((_3 = p.time) !== null && _3 !== void 0 ? _3 : 0));
                surveyNight.push(0);
            }
            else if (p.shift === "Noche") {
                surveyDay.push(0);
                surveyNight.push(Number((_4 = p.time) !== null && _4 !== void 0 ? _4 : 0));
            }
            else {
                surveyDay.push(0);
                surveyNight.push(0);
            }
            surveyKpi.push(Number(surveyKpiValue));
            surveyRaw.push({
                index: p.index,
                time: Number((_5 = p.time) !== null && _5 !== void 0 ? _5 : 0),
                shift: (_6 = p.shift) !== null && _6 !== void 0 ? _6 : "",
                kpi: Number(surveyKpiValue),
            });
        }
        // --- TIEMPOS DE CONEXIÓN POR TURNO ---
        const conexionFiltered = await project.perforations
            .filter((p) => p.activity == "Conexión")
            .map((p, idx) => (Object.assign(Object.assign({}, p._doc), { index: idx + 1 })));
        const conexionLabels = [];
        const conexionTime = [];
        const conexionDay = [];
        const conexionNight = [];
        const conexionKpi = [];
        const conexionRaw = [];
        // Helper para buscar el KPI de conexión por depth_from
        function getConexionKpi(depth) {
            var _a, _b;
            const arr = (_b = (_a = project.project_static_data) === null || _a === void 0 ? void 0 : _a.conex_kpi) !== null && _b !== void 0 ? _b : [];
            let kpiValue = 0;
            for (let i = 0; i < arr.length; i++) {
                const curr = arr[i];
                const next = arr[i + 1];
                if (next && depth >= curr.depth && depth < next.depth) {
                    kpiValue = curr.rop;
                    break;
                }
                if (!next && depth >= curr.depth) {
                    kpiValue = curr.rop;
                    break;
                }
            }
            return Number(kpiValue !== null && kpiValue !== void 0 ? kpiValue : 0);
        }
        for (const p of conexionFiltered) {
            conexionLabels.push(p.index);
            conexionTime.push(Number((_7 = p.time) !== null && _7 !== void 0 ? _7 : 0));
            if (p.shift === "Día") {
                conexionDay.push(Number((_8 = p.time) !== null && _8 !== void 0 ? _8 : 0));
                conexionNight.push(0);
            }
            else if (p.shift === "Noche") {
                conexionDay.push(0);
                conexionNight.push(Number((_9 = p.time) !== null && _9 !== void 0 ? _9 : 0));
            }
            else {
                conexionDay.push(0);
                conexionNight.push(0);
            }
            // Buscar el KPI por depth_from
            const kpiValue = getConexionKpi((_10 = p.depth_from) !== null && _10 !== void 0 ? _10 : 0);
            conexionKpi.push(Number(kpiValue));
            conexionRaw.push({
                index: p.index,
                time: Number((_11 = p.time) !== null && _11 !== void 0 ? _11 : 0),
                shift: (_12 = p.shift) !== null && _12 !== void 0 ? _12 : "",
                kpi: Number(kpiValue),
            });
        }
        return {
            charts: {
                activityPie: {
                    labels,
                    data,
                    percentages,
                    raw,
                },
                drilledFeetPlanVsReal: {
                    labels: drilledFeetLabels,
                    planned: drilledFeetPlanned,
                    real: drilledFeetReal,
                    raw: drilledFeetRaw,
                },
                drilledFeetDay: {
                    labels: drilledFeetDayLabels,
                    planned: drilledFeetDayPlanned,
                    real: drilledFeetDayReal,
                    raw: drilledFeetDayRaw,
                },
                drilledFeetNight: {
                    labels: drilledFeetNightLabels,
                    planned: drilledFeetNightPlanned,
                    real: drilledFeetNightReal,
                    raw: drilledFeetNightRaw,
                },
                ropAverage: {
                    labels: ropAvgLabels,
                    planned: ropAvgPlanned,
                    real: ropAvgReal,
                    raw: ropAvgRaw,
                },
                ropRotatedByShift: {
                    labels: ropRotatedLabels,
                    ropDay: ropRotatedDay,
                    ropNight: ropRotatedNight,
                    ropKpi: ropRotatedKpi,
                    raw: ropRotatedRaw,
                },
                reviewTimeByShift: {
                    labels: reviewLabels,
                    time: reviewTime,
                    day: reviewDay,
                    night: reviewNight,
                    kpi: reviewKpi,
                    raw: reviewRaw,
                },
                surveyTimeByShift: {
                    labels: surveyLabels,
                    time: surveyTime,
                    day: surveyDay,
                    night: surveyNight,
                    kpi: surveyKpi,
                    raw: surveyRaw,
                },
                conexionTimeByShift: {
                    labels: conexionLabels,
                    time: conexionTime,
                    day: conexionDay,
                    night: conexionNight,
                    kpi: conexionKpi,
                    raw: conexionRaw,
                },
                // Aquí se podrán agregar más tipos de gráficas en el futuro
            },
            // Puedes agregar aquí otros datos generales del proyecto si lo necesitas
        };
    }
    async updateProject(projectId, updateData) {
        if (!projectId)
            throw new Error("Project ID is required");
        const project = await this.proyects.findById(projectId);
        if (!project)
            throw new Error("Project not found");
        console.log("Update Data:", updateData);
        // Actualizar todos los campos del DTO si están presentes en updateData
        Object.assign(project, updateData);
        project.has_changes = new Date();
        await project.save();
        return project;
    }
    async deleteProject(projectId) {
        if (!projectId)
            throw new Error("Project ID is required");
        const project = await this.proyects.findByIdAndDelete(projectId);
        if (!project)
            throw new Error("Project not found");
        return { _id: projectId, deleted: true };
    }
    async resetProjectChanges(projectId) {
        await this.proyects.findByIdAndUpdate(projectId, { has_changes: false });
    }
}
exports.default = ProjectService;
//# sourceMappingURL=project.service.js.map