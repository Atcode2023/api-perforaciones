import { IOptions, QueryResult } from "../paginate/paginate";
import pick from "../utils/pick";
import { CreateProjectDto } from "../dtos/project.dto";
import projectModel, {
  Bha,
  IUProyectModel,
  Perforations,
  Project,
} from "../models/proyect.model";
import mongoose from "mongoose";

class ProjectService {
  public proyects = projectModel;

  public async createProject(projectData: CreateProjectDto): Promise<Project> {
    if (!projectData) throw new Error("Project data is empty");

    // Convertir ing_day e ing_night a ObjectId
    const ingDayId = new mongoose.Types.ObjectId(projectData.ing_day);
    const ingNightId = new mongoose.Types.ObjectId(projectData.ing_night);

    const proyect = await this.proyects.create({
      ...projectData,
      ing_day: ingDayId,
      ing_night: ingNightId,
      created_at: new Date(),
      deleted_at: null,
    });

    return proyect;
  }

  public async createBha(projectId: string, bhaData: Bha): Promise<any> {
    if (!projectId || !bhaData)
      throw new Error("Project ID or BHA data is empty");

    const project = await this.proyects.findById(projectId);
    if (!project) throw new Error("Project doesn't exist");

    project.bhas.push(bhaData);
    project.has_changes = new Date();
    await project.save();

    return bhaData;
  }

  public async updateBha(
    projectId: string,
    bhaId: string,
    updateData: Partial<Bha>
  ): Promise<any> {
    const project = await this.proyects.findById(projectId);
    if (!project) throw new Error("Project not found");
    const bha =
      project.bhas.id(bhaId) ||
      project.bhas.find((b: any) => b._id?.toString() === bhaId);
    if (!bha) throw new Error("BHA not found");
    Object.assign(bha, updateData);
    (project as any).markModified("bhas");
    project.has_changes = new Date();
    await project.save();
    return bha;
  }

  public async deleteBha(projectId: string, bhaId: string): Promise<any> {
    const project = await this.proyects.findById(projectId);
    if (!project) throw new Error("Project not found");
    const index = project.bhas.findIndex(
      (b: any) => b._id?.toString() === bhaId
    );
    if (index === -1) throw new Error("BHA not found");
    project.bhas.splice(index, 1);
    (project as any).markModified("bhas");
    project.has_changes = new Date();
    await project.save();
    return { _id: bhaId, deleted: true };
  }

  public async createPerforation(
    projectId: string,
    perforationData: Perforations
  ): Promise<any> {
    if (!projectId || !perforationData)
      throw new Error("Project ID or Perforation data is empty");

    const project = await this.proyects.findById(projectId);
    if (!project) throw new Error("Project doesn't exist");

    // Calcular campos
    this.calculatePerforationFields(perforationData, project);

    // Asignar _id si no existe
    if (!perforationData._id) {
      perforationData._id = new mongoose.Types.ObjectId();
    }

    project.perforations.push(perforationData);
    project.has_changes = new Date();
    await project.save();

    return perforationData;
  }

  public async updatePerforation(
    projectId: string,
    perforationId: string,
    updateData: Partial<Perforations>
  ): Promise<any> {
    const project = await this.proyects.findById(projectId);
    if (!project) throw new Error("Project not found");

    const index = project.perforations.findIndex(
      (p: any) => p._id?.toString() === perforationId
    );
    if (index === -1) throw new Error("Perforation not found");

    const perforation: any = project.perforations[index];
    Object.assign(perforation, updateData);

    // Calcular campos actualizados
    this.calculatePerforationFields(perforation, project);

    // Asegurar que Mongoose detecte cambios en el subdocumento
    (project as any).markModified("perforations");
    project.has_changes = new Date();
    await project.save();
    return perforation;
  }

  public async deletePerforation(
    projectId: string,
    perforationId: string
  ): Promise<any> {
    const project = await this.proyects.findById(projectId);
    if (!project) throw new Error("Project not found");
    const index = project.perforations.findIndex(
      (p: any) => p._id?.toString() === perforationId
    );
    if (index === -1) throw new Error("Perforation not found");

    project.perforations.splice(index, 1);
    project.has_changes = new Date();
    await project.save();
    return { _id: perforationId, deleted: true };
  }

  public async findAllProjects(
    filter: Record<string, any>,
    options: IOptions,
    req?: any
  ): Promise<QueryResult> {
    let query: Record<string, any> = {};
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
    const user = req?.user;
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
    } else if (user.role === "SUPERVISOR") {
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
    const projects: any = await this.proyects.paginate(query, options);
    // Si hay resultados, hacer populate manualmente
    if (projects.results && projects.results.length > 0) {
      const populatedResults = await Promise.all(
        projects.results.map(async (proj: any) => {
          return await projectModel
            .findById(proj._id)
            .populate("ing_day", "username role")
            .populate("ing_night", "username role")
            .populate("supervisor", "username role")
            .lean();
        })
      );
      projects.results = populatedResults;
    }
    return projects;
  }

  public async findProjectById(projectId: string): Promise<any> {
    if (!projectId) throw new Error("Project ID is required");
    // Usar populate para cargar ing_day e ing_night
    const project = await this.proyects
      .findById(projectId)
      .populate("ing_day")
      .populate("ing_night");
    if (!project) return null;

    // Calcular KPI performance
    const performance: any = {};

    // Rotating: sumar drilled_meters y time de perforaciones con activity "Rota"
    const rotatingFt = project.perforations
      .filter((p: any) => p.activity === "Rota")
      .reduce((sum: number, p: any) => sum + (p.drilled_meters ?? 0), 0);

    // Perforated: sumar drilled_meters de todas las perforaciones (para el cálculo de percentage)

    const rotatingHs = project.perforations
      .filter((p: any) => p.activity === "Rota")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    performance.rotating = {
      title: "Rota Total",
      ft: Number(rotatingFt),
      hs: Number(rotatingHs),
      rop: rotatingHs !== 0 ? Number(rotatingFt / rotatingHs) : 0,
      percentage: 0,
    };

    // Sliding: sumar drilled_meters de perforaciones con activity "Desliza"
    const slidingFt = project.perforations
      .filter((p: any) => p.activity === "Desliza")
      .reduce((sum: number, p: any) => sum + (p.drilled_meters ?? 0), 0);

    const slidingHs = project.perforations
      .filter((p: any) => p.activity === "Desliza")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

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
    const perforatedRop =
      perforatedHs !== 0 ? Number(perforatedFt / perforatedHs) : 0;

    performance.perforated = {
      title: "Perforado Total",
      ft: Number(perforatedFt),
      hs: Number(perforatedHs),
      rop: Number(perforatedRop),
      percentage: 0,
    };

    const rotatingPercentage =
      rotatingFt > 0 ? Number((rotatingFt / perforatedFt) * 100) : 0;
    const slidingPercentage =
      slidingFt > 0 ? Number((slidingFt / perforatedFt) * 100) : 0;

    performance.rotating.percentage = Number(rotatingPercentage);
    performance.sliding.percentage = Number(slidingPercentage);

    const byFilterFt = project.perforations.reduce((sum: any, p: any) => {
      sum + (p.footage ?? 0);
    }, 0);

    const byFilterHs = project.perforations.reduce((sum: any, p: any) => {
      sum + (p.time ?? 0);
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
      .filter((p: any) =>
        ["Rota", "Desliza", "Survey", "Conexión", "Repasa"].includes(p.activity)
      )
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);
    const averageRop = averageHs !== 0 ? Number(averageFt / averageHs) : 0;

    performance.average = {
      title: "Promedio",
      ft: Number(averageFt),
      hs: Number(averageHs),
      rop: Number(averageRop),
      percentage: 0,
    };

    const slidingDayFt = project.perforations
      .filter((p: any) => p.activity === "Desliza" && p.shift == "Día")
      .reduce((sum: number, p: any) => sum + (p.drilled_meters ?? 0), 0);

    const slidingDayHs = project.perforations
      .filter((p: any) => p.activity === "Desliza" && p.shift == "Día")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    const slidingDayRop =
      slidingDayHs !== 0 ? Number(slidingDayFt / slidingDayHs) : 0;

    performance.sliding_day = {
      title: "Desliza Día",
      ft: Number(slidingDayFt),
      hs: Number(slidingDayHs),
      rop: Number(slidingDayRop),
      percentage: 0,
    };

    const slidingNightFt = project.perforations
      .filter((p: any) => p.activity === "Desliza" && p.shift == "Noche")
      .reduce((sum: number, p: any) => sum + (p.drilled_meters ?? 0), 0);

    const slidingNightHs = project.perforations
      .filter((p: any) => p.activity === "Desliza" && p.shift == "Noche")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    const slidingNightRop =
      slidingNightHs !== 0 ? Number(slidingNightFt / slidingNightHs) : 0;

    performance.sliding_night = {
      title: "Desliza Noche",
      ft: Number(slidingNightFt),
      hs: Number(slidingNightHs),
      rop: Number(slidingNightRop),
      percentage: 0,
    };

    // Rota Día
    const rotatingDayFt = project.perforations
      .filter((p: any) => p.activity === "Rota" && p.shift == "Día")
      .reduce((sum: number, p: any) => sum + (p.drilled_meters ?? 0), 0);

    const rotatingDayHs = project.perforations
      .filter((p: any) => p.activity === "Rota" && p.shift == "Día")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    const rotatingDayRop =
      rotatingDayHs !== 0 ? Number(rotatingDayFt / rotatingDayHs) : 0;

    performance.rotating_day = {
      title: "Rota Día",
      ft: Number(rotatingDayFt),
      hs: Number(rotatingDayHs),
      rop: Number(rotatingDayRop),
      percentage: 0,
    };

    // Rota Noche
    const rotatingNightFt = project.perforations
      .filter((p: any) => p.activity === "Rota" && p.shift == "Noche")
      .reduce((sum: number, p: any) => sum + (p.drilled_meters ?? 0), 0);

    const rotatingNightHs = project.perforations
      .filter((p: any) => p.activity === "Rota" && p.shift == "Noche")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    const rotatingNightRop =
      rotatingNightHs !== 0 ? Number(rotatingNightFt / rotatingNightHs) : 0;

    performance.rotating_night = {
      title: "Rota Noche",
      ft: Number(rotatingNightFt),
      hs: Number(rotatingNightHs),
      rop: Number(rotatingNightRop),
      percentage: 0,
    };

    // Calcular Informacion de Tiempos

    const time_information: any = {};

    const drillingTime = project.perforations
      .filter((p: any) => p.activity === "Rota" || p.activity === "Desliza")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    time_information.drilling_time = {
      title: "Tiempo de Perforación",
      hs: Number(drillingTime),
    };

    const rotatingTime = project.perforations
      .filter((p: any) => p.activity === "Rota")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    time_information.rotating_time = {
      title: "Tiempo de Rota",
      hs: Number(rotatingTime),
    };

    const slidingTime = project.perforations
      .filter((p: any) => p.activity === "Desliza")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    time_information.sliding_time = {
      title: "Tiempo de Desliza",
      hs: Number(slidingTime),
    };

    const drivingTime = project.perforations
      .filter((p: any) =>
        [
          "Circula",
          "Orienta TF",
          "Survey",
          "Repasa",
          "Perfora cemento",
          "Comando",
          "Geonavegación",
        ].includes(p.activity)
      )
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

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
      .filter((p: any) =>
        [
          "Conexión",
          "Arma BHA",
          "Desarma BHA",
          "Otros",
          "Calibra",
          "POOH CSG",
          "POOH OH",
          "RIH OH",
          "RIH CSG",
        ].includes(p.activity)
      )
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    time_information.conex_others = {
      title: "Tiempo de Conexiones y Otros",
      hs: Number(conexOthersTime),
    };

    // Calcular parametros

    const parameters: any = {};

    const wobMin = project.perforations
      .filter((p: any) => p.wob !== undefined)
      .reduce((min: number, p: any) => Math.min(min, p.wob), Infinity);

    const wobMax = project.perforations
      .filter((p: any) => p.wob !== undefined)
      .reduce((max: number, p: any) => Math.max(max, p.wob), -Infinity);

    const wobValues = project.perforations
      .filter((p: any) => p.wob !== undefined)
      .map((p: any) => p.wob);

    const wobAverage =
      wobValues.length > 0
        ? Number(
            wobValues.reduce((sum: number, w: number) => sum + w, 0) /
              wobValues.length
          )
        : 0;

    parameters.wob = {
      title: "WOB - Ton",
      min: wobMin === Infinity ? 0 : Number(wobMin),
      max: wobMax === -Infinity ? 0 : Number(wobMax),
      average: wobAverage,
    };

    const caudalMin = project.perforations
      .filter((p: any) => p.caudal !== undefined)
      .reduce((min: number, p: any) => Math.min(min, p.caudal), Infinity);

    const caudalMax = project.perforations
      .filter((p: any) => p.caudal !== undefined)
      .reduce((max: number, p: any) => Math.max(max, p.caudal), -Infinity);

    const caudalValues = project.perforations
      .filter((p: any) => p.caudal !== undefined)
      .map((p: any) => p.caudal);

    const caudalAverage =
      caudalValues.length > 0
        ? Number(
            caudalValues.reduce((sum: number, c: number) => sum + c, 0) /
              caudalValues.length
          )
        : 0;

    parameters.caudal = {
      title: "Caudal - QPM",
      min: caudalMin === Infinity ? 0 : Number(caudalMin),
      max: caudalMax === -Infinity ? 0 : Number(caudalMax),
      average: caudalAverage,
    };

    const diffPressureMin = project.perforations
      .filter((p: any) => p.differential_pressure !== undefined)
      .reduce(
        (min: number, p: any) => Math.min(min, p.differential_pressure),
        Infinity
      );

    const diffPressureMax = project.perforations
      .filter((p: any) => p.differential_pressure !== undefined)
      .reduce(
        (max: number, p: any) => Math.max(max, p.differential_pressure),
        -Infinity
      );

    const diffPressureValues = project.perforations
      .filter((p: any) => p.differential_pressure !== undefined)
      .map((p: any) => p.differential_pressure);

    const diffPressureAverage =
      diffPressureValues.length > 0
        ? Number(
            diffPressureValues.reduce((sum: number, d: number) => sum + d, 0) /
              diffPressureValues.length
          )
        : 0;

    parameters.differential_pressure = {
      title: "Presión Diferencial - PSI",
      min: diffPressureMin === Infinity ? 0 : Number(diffPressureMin),
      max: diffPressureMax === -Infinity ? 0 : Number(diffPressureMax),
      average: diffPressureAverage,
    };

    // SPP Bottom
    const sppBottomMin = project.perforations
      .filter((p: any) => p.spp_bottom !== undefined)
      .reduce((min: number, p: any) => Math.min(min, p.spp_bottom), Infinity);

    const sppBottomMax = project.perforations
      .filter((p: any) => p.spp_bottom !== undefined)
      .reduce((max: number, p: any) => Math.max(max, p.spp_bottom), -Infinity);

    const sppBottomValues = project.perforations
      .filter((p: any) => p.spp_bottom !== undefined)
      .map((p: any) => p.spp_bottom);

    const sppBottomAverage =
      sppBottomValues.length > 0
        ? Number(
            sppBottomValues.reduce((sum: number, v: number) => sum + v, 0) /
              sppBottomValues.length
          )
        : 0;

    parameters.spp_bottom = {
      title: "SPP Bottom - PSI",
      min: sppBottomMin === Infinity ? 0 : Number(sppBottomMin),
      max: sppBottomMax === -Infinity ? 0 : Number(sppBottomMax),
      average: sppBottomAverage,
    };

    // SPP Out Bottom
    const sppOutBottomMin = project.perforations
      .filter((p: any) => p.spp_out_bottom !== undefined)
      .reduce(
        (min: number, p: any) => Math.min(min, p.spp_out_bottom),
        Infinity
      );

    const sppOutBottomMax = project.perforations
      .filter((p: any) => p.spp_out_bottom !== undefined)
      .reduce(
        (max: number, p: any) => Math.max(max, p.spp_out_bottom),
        -Infinity
      );

    const sppOutBottomValues = project.perforations
      .filter((p: any) => p.spp_out_bottom !== undefined)
      .map((p: any) => p.spp_out_bottom);

    const sppOutBottomAverage =
      sppOutBottomValues.length > 0
        ? Number(
            sppOutBottomValues.reduce((sum: number, v: number) => sum + v, 0) /
              sppOutBottomValues.length
          )
        : 0;

    parameters.spp_out_bottom = {
      title: "SPP Out Bottom - PSI",
      min: sppOutBottomMin === Infinity ? 0 : Number(sppOutBottomMin),
      max: sppOutBottomMax === -Infinity ? 0 : Number(sppOutBottomMax),
      average: sppOutBottomAverage,
    };

    // TQ Bottom
    const tqBottomMin = project.perforations
      .filter((p: any) => p.tq_bottom !== undefined)
      .reduce((min: number, p: any) => Math.min(min, p.tq_bottom), Infinity);

    const tqBottomMax = project.perforations
      .filter((p: any) => p.tq_bottom !== undefined)
      .reduce((max: number, p: any) => Math.max(max, p.tq_bottom), -Infinity);

    const tqBottomValues = project.perforations
      .filter((p: any) => p.tq_bottom !== undefined)
      .map((p: any) => p.tq_bottom);

    const tqBottomAverage =
      tqBottomValues.length > 0
        ? Number(
            tqBottomValues.reduce((sum: number, v: number) => sum + v, 0) /
              tqBottomValues.length
          )
        : 0;

    parameters.tq_bottom = {
      title: "TQ Bottom - ft-lb",
      min: tqBottomMin === Infinity ? 0 : Number(tqBottomMin),
      max: tqBottomMax === -Infinity ? 0 : Number(tqBottomMax),
      average: tqBottomAverage,
    };

    // TQ Out Bottom
    const tqOutBottomMin = project.perforations
      .filter((p: any) => p.tq_out_bottom !== undefined)
      .reduce(
        (min: number, p: any) => Math.min(min, p.tq_out_bottom),
        Infinity
      );

    const tqOutBottomMax = project.perforations
      .filter((p: any) => p.tq_out_bottom !== undefined)
      .reduce(
        (max: number, p: any) => Math.max(max, p.tq_out_bottom),
        -Infinity
      );

    const tqOutBottomValues = project.perforations
      .filter((p: any) => p.tq_out_bottom !== undefined)
      .map((p: any) => p.tq_out_bottom);

    const tqOutBottomAverage =
      tqOutBottomValues.length > 0
        ? Number(
            tqOutBottomValues.reduce((sum: number, v: number) => sum + v, 0) /
              tqOutBottomValues.length
          )
        : 0;

    parameters.tq_out_bottom = {
      title: "TQ Out Bottom - ft-lb",
      min: tqOutBottomMin === Infinity ? 0 : Number(tqOutBottomMin),
      max: tqOutBottomMax === -Infinity ? 0 : Number(tqOutBottomMax),
      average: tqOutBottomAverage,
    };

    // Total RPM
    const totalRpmMin = project.perforations
      .filter((p: any) => p.total_rpm !== undefined)
      .reduce((min: number, p: any) => Math.min(min, p.total_rpm), Infinity);

    const totalRpmMax = project.perforations
      .filter((p: any) => p.total_rpm !== undefined)
      .reduce((max: number, p: any) => Math.max(max, p.total_rpm), -Infinity);

    const totalRpmValues = project.perforations
      .filter((p: any) => p.total_rpm !== undefined)
      .map((p: any) => p.total_rpm);

    const totalRpmAverage =
      totalRpmValues.length > 0
        ? Number(
            totalRpmValues.reduce((sum: number, v: number) => sum + v, 0) /
              totalRpmValues.length
          )
        : 0;

    parameters.total_rpm = {
      title: "Total RPM",
      min: totalRpmMin === Infinity ? 0 : Number(totalRpmMin),
      max: totalRpmMax === -Infinity ? 0 : Number(totalRpmMax),
      average: totalRpmAverage,
    };

    // Calcular Survey Time

    const surveyTime = project.perforations
      .filter((p: any) => p.activity === "Survey")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    // Calcular Viajes

    const trips: any = {};

    const rihCsgSum = project.perforations
      .filter((p: any) => p.activity === "RIH CSG")
      .reduce((sum: number, p: any) => sum + (p.drilled_meters ?? 0), 0);

    const rihCsgTimeSum = project.perforations
      .filter((p: any) => p.activity === "RIH CSG")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    trips.rih_csg = {
      title: "RIH CSG",
      ft_hs: rihCsgTimeSum !== 0 ? Number(rihCsgSum / rihCsgTimeSum) : 0,
    };

    const rihOhSum = project.perforations
      .filter((p: any) => p.activity === "RIH OH")
      .reduce((sum: number, p: any) => sum + (p.drilled_meters ?? 0), 0);

    const rihOhTimeSum = project.perforations
      .filter((p: any) => p.activity === "RIH OH")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    trips.rih_oh = {
      title: "RIH OH",
      ft_hs: rihOhTimeSum !== 0 ? Number(rihOhSum / rihOhTimeSum) : 0,
    };

    const poohCsgSum = project.perforations
      .filter((p: any) => p.activity === "POOH CSG")
      .reduce((sum: number, p: any) => sum + (p.drilled_meters ?? 0), 0);

    const poohCsgTimeSum = project.perforations
      .filter((p: any) => p.activity === "POOH CSG")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    trips.pooh_csg = {
      title: "POOH CSG",
      ft_hs: poohCsgTimeSum !== 0 ? Number(poohCsgSum / poohCsgTimeSum) : 0,
    };

    const poohOhSum = project.perforations
      .filter((p: any) => p.activity === "POOH OH")
      .reduce((sum: number, p: any) => sum + (p.drilled_meters ?? 0), 0);

    const poohOhTimeSum = project.perforations
      .filter((p: any) => p.activity === "POOH OH")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    trips.pooh_oh = {
      title: "POOH OH",
      ft_hs: poohOhTimeSum !== 0 ? Number(poohOhSum / poohOhTimeSum) : 0,
    };

    // Calcular Conexiones

    const conex_time: any = {};

    const conexDaySum = project.perforations
      .filter((p: any) => p.activity === "Conexión" && p.shift === "Día")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    const conexDayCount = project.perforations.filter(
      (p: any) => p.activity === "Conexión" && p.shift === "Día"
    ).length;

    conex_time.day = {
      title: "Día",
      count: conexDayCount,
      hs: Number(conexDaySum),
    };

    const conexNightSum = project.perforations
      .filter((p: any) => p.activity === "Conexión" && p.shift === "Noche")
      .reduce((sum: number, p: any) => sum + (p.time ?? 0), 0);

    const conexNightCount = project.perforations.filter(
      (p: any) => p.activity === "Conexión" && p.shift === "Noche"
    ).length;

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
    return {
      ...project.toObject(),
      kpi: {
        performance,
        time_information,
        parameters,
        survey_time: {
          title: "Tiempo de Survey",
          hs: Number(surveyTime.toFixed(2)),
        },
        trips,
        conex_time,
      },
    };
  }

  public async createProjectStaticData(projectId: string, staticData: any) {
    const project = await projectModel.findById(projectId);
    if (!project) throw new Error("Proyecto no encontrado");

    // Calcular total_rcs sumando rop de conex_kpi, time de review_kpi y time de survey_kpi por posición
    const totalLength = Math.max(
      staticData.conex_kpi?.length ?? 0,
      staticData.review_kpi?.length ?? 0,
      staticData.survey_kpi?.length ?? 0
    );
    const total_rcs = [];
    for (let i = 0; i < totalLength; i++) {
      const rop = staticData.conex_kpi?.[i]?.rop ?? 0;
      const reviewTime = staticData.review_kpi?.[i]?.time ?? 0;
      const surveyTime = staticData.survey_kpi?.[i]?.time ?? 0;
      total_rcs.push({ time: rop + reviewTime + surveyTime });
    }
    staticData.total_rcs = total_rcs;

    project.project_static_data = staticData;
    project.has_changes = new Date();
    await project.save();
    return project.project_static_data;
  }

  private calculatePerforationFields(perforationData: any, project: any) {
    // Calcular created_at y from_time
    if (!perforationData.created_at) {
      perforationData.created_at = new Date();
    }
    const date = new Date(perforationData.created_at);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const from_time = hours + minutes / 60;
    perforationData.from_time = Number(from_time.toFixed(2));
    perforationData.time = Number(
      Math.abs(from_time - perforationData.to_time).toFixed(2)
    );

    // Calcular depth_from del último perforation
    const perforations = project.perforations;
    if (perforations.length > 1) {
      // Si viene _id, buscar la perforación anterior a ese _id
      if (perforationData._id) {
        const idx = perforations.findIndex(
          (p: any) => p._id?.toString() === perforationData._id?.toString()
        );
        if (idx != -1) {
          perforationData.depth_from = perforations[idx - 1].depth_to ?? 0;
        } else {
          perforationData.depth_from = project.entry_depth ?? 0;
        }
      } else {
        const lastPerforation = perforations[perforations.length - 1];
        perforationData.depth_from = lastPerforation.depth_to ?? 0;
      }
    } else {
      perforationData.depth_from = project.entry_depth ?? 0;
    }

    // Calcular circulates_out_of_background
    perforationData.circulates_out_of_background =
      perforationData.activity === "Circula" ? perforationData.time : 0;

    // Calcular drilled_meters con 2 decimales
    perforationData.drilled_meters = Number(
      (perforationData.depth_to - perforationData.depth_from).toFixed(2)
    );

    // Calcular effective_rop solo si activity es 'Rota' o 'Desliza', 2 decimales
    if (
      perforationData.activity === "Rota" ||
      perforationData.activity === "Desliza"
    ) {
      perforationData.effective_rop =
        perforationData.time !== 0
          ? Number(
              (perforationData.drilled_meters / perforationData.time).toFixed(2)
            )
          : 0;
    } else {
      perforationData.effective_rop = 0;
    }

    // Calcular total_rpm con 2 decimales
    if (perforationData.activity === "Comentario") {
      perforationData.total_rpm = 0;
    } else if (!perforationData.bha) {
      perforationData.total_rpm = 0;
    } else if (!perforationData.caudal || perforationData.caudal <= 0) {
      perforationData.total_rpm = Number(
        perforationData.rpm_surface?.toFixed(2) ?? 0
      );
    } else {
      const bhaSelected = project.bhas.find(
        (bha: any) => bha._id?.toString() === perforationData.bha?.toString()
      );
      const factor = bhaSelected?.factor ?? 0;
      perforationData.total_rpm = Number(
        (perforationData.rpm_surface + factor).toFixed(2)
      );
    }

    // Calcular differential_pressure con 2 decimales
    perforationData.differential_pressure = Number(
      Math.abs(
        (perforationData.spp_bottom ?? 0) -
          (perforationData.spp_out_bottom ?? 0)
      ).toFixed(2)
    );

    // Calcular rop_kpi usando rop_efec_kpi de project_static_data
    if (
      (perforationData.activity === "Rota" ||
        perforationData.activity === "Desliza") &&
      perforationData.depth_from &&
      perforationData.depth_to &&
      perforationData.depth_from > 0 &&
      perforationData.depth_to > 0 &&
      project.project_static_data &&
      Array.isArray(project.project_static_data.rop_efec_kpi)
    ) {
      // Buscar el rango donde depth_from esté entre depth[i] y depth[i+1]
      const ropKpiArr = project.project_static_data.rop_efec_kpi;
      let ropValue = 0;
      for (let i = 0; i < ropKpiArr.length; i++) {
        const curr = ropKpiArr[i];
        const next = ropKpiArr[i + 1];
        if (
          next &&
          perforationData.depth_from >= curr.depth &&
          perforationData.depth_from < next.depth
        ) {
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
    } else {
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
    if (
      validActivitiesEfe.includes(perforationData.activity) &&
      perforationData.depth_from !== undefined &&
      perforationData.depth_to !== undefined &&
      perforationData.depth_from !== 0 &&
      perforationData.depth_to !== 0 &&
      perforationData.depth_from !== perforationData.depth_to &&
      project.project_static_data &&
      Array.isArray(project.project_static_data.rop_avg_kpi)
    ) {
      const ropAvgArr = project.project_static_data.rop_avg_kpi;
      let ropEfeValue = 0;
      for (let i = 0; i < ropAvgArr.length; i++) {
        const curr = ropAvgArr[i];
        const next = ropAvgArr[i + 1];
        if (
          next &&
          perforationData.depth_from >= curr.depth &&
          perforationData.depth_from < next.depth
        ) {
          ropEfeValue = curr.rop;
          break;
        }
        if (!next && perforationData.depth_from >= curr.depth) {
          ropEfeValue = curr.rop;
          break;
        }
      }
      perforationData.rop_efe_kpi = Number(ropEfeValue.toFixed(2));
    } else {
      perforationData.rop_efe_kpi = 0;
    }

    // Calcular footage
    if (
      perforationData.activity === "Rota" ||
      perforationData.activity === "Desliza"
    ) {
      perforationData.footage = perforationData.drilled_meters;
    } else {
      perforationData.footage = 0;
    }

    // Calcular rop_avg según la fórmula (footage / time si footage > 0)
    if (perforationData.footage > 0 && perforationData.time) {
      perforationData.rop_avg = Number(
        (perforationData.footage / perforationData.time).toFixed(2)
      );
    } else {
      perforationData.rop_avg = 0;
    }

    // Calcular rop_trips con 2 decimales
    const validActivities = ["RIH CSG", "RIH OH", "POOH CSG", "POOH OH"];
    if (
      validActivities.includes(perforationData.activity) &&
      perforationData.depth_from !== undefined &&
      perforationData.depth_to !== undefined &&
      perforationData.depth_from !== perforationData.depth_to &&
      perforationData.drilled_meters !== undefined &&
      perforationData.time
    ) {
      perforationData.rop_trips = Number(
        Math.abs(perforationData.drilled_meters / perforationData.time).toFixed(
          2
        )
      );
    } else {
      perforationData.rop_trips = 0;
    }
  }

  /**
   * Prepara la data para gráficas del proyecto.
   * Por ahora incluye la data para pie chart de actividades, pero está listo para agregar más.
   */
  public async ReportProject(projectId: string): Promise<{
    charts: {
      activityPie?: {
        labels: string[];
        data: number[];
        percentages: number[];
        raw: { activity: string; time: number; percentage: number }[];
      };
      drilledFeetPlanVsReal?: {
        labels: string[];
        planned: number[];
        real: number[];
        raw: { date: string; planned: number; real: number }[];
      };
      drilledFeetDay?: {
        labels: string[];
        planned: number[];
        real: number[];
        raw: { date: string; planned: number; real: number }[];
      };
      drilledFeetNight?: {
        labels: string[];
        planned: number[];
        real: number[];
        raw: { date: string; planned: number; real: number }[];
      };
      ropAverage?: {
        labels: string[];
        planned: number[];
        real: number[];
        raw: { date: string; planned: number; real: number }[];
      };
      ropRotatedByShift?: {
        labels: string[];
        ropDay: number[];
        ropNight: number[];
        ropKpi: number[];
        raw: {
          date: string;
          ropDay: number;
          ropNight: number;
          ropKpi: number;
        }[];
      };
      reviewTimeByShift?: {
        labels: number[]; // índice de perforación
        time: number[];
        day: number[];
        night: number[];
        kpi: number[];
        raw: { index: number; time: number; shift: string; kpi: number }[];
      };
      surveyTimeByShift?: {
        labels: number[]; // índice de perforación
        time: number[];
        day: number[];
        night: number[];
        kpi: number[];
        raw: { index: number; time: number; shift: string; kpi: number }[];
      };
      conexionTimeByShift?: {
        labels: number[]; // índice de perforación
        time: number[];
        day: number[];
        night: number[];
        kpi: number[];
        raw: { index: number; time: number; shift: string; kpi: number }[];
      };
      // Aquí se podrán agregar más tipos de gráficas en el futuro
    };
    // Puedes agregar aquí otros datos generales del proyecto si lo necesitas
  }> {
    if (!projectId) throw new Error("Project ID is required");
    const project = await this.proyects.findById(projectId);
    if (!project) throw new Error("Project not found");

    // Pie chart: Agrupar tiempos por actividad
    const activityTimes: Record<string, number> = {};
    for (const p of project.perforations) {
      if (!p.activity || typeof p.time !== "number") continue;
      activityTimes[p.activity] = (activityTimes[p.activity] ?? 0) + p.time;
    }
    const totalTime = Object.values(activityTimes).reduce(
      (sum, t) => sum + t,
      0
    );

    const labels: string[] = [];
    const data: number[] = [];
    const percentages: number[] = [];
    const raw: { activity: string; time: number; percentage: number }[] = [];

    for (const [activity, time] of Object.entries(activityTimes)) {
      labels.push(activity);
      data.push(Number(time.toFixed(2)));
      const percent =
        totalTime > 0 ? Number(((time / totalTime) * 100).toFixed(2)) : 0;
      percentages.push(percent);
      raw.push({
        activity,
        time: Number(time.toFixed(2)),
        percentage: percent,
      });
    }

    // Nueva gráfica: Pies Perforados Plan vs Real
    // Filtrar perforaciones con activity 'Rota' o 'Desliza'
    const filtered = project.perforations.filter(
      (p: any) => p.activity === "Rota" || p.activity === "Desliza"
    );

    // Agrupar por fecha (solo YYYY-MM-DD)
    const groupByDate: Record<string, { planned: number; real: number }> = {};
    for (const p of filtered) {
      if (!p.created_at) continue;
      const date = new Date(p.created_at);
      // Formato YYYY-MM-DD
      const dateStr = date.toISOString().slice(0, 10);
      if (!groupByDate[dateStr]) {
        groupByDate[dateStr] = { planned: 0, real: 0 };
      }
      groupByDate[dateStr].planned += Number(p.pierced_feet_kpi ?? 0);
      groupByDate[dateStr].real += Number(p.drilled_meters ?? 0);
    }

    const drilledFeetLabels: string[] = [];
    const drilledFeetPlanned: number[] = [];
    const drilledFeetReal: number[] = [];
    const drilledFeetRaw: { date: string; planned: number; real: number }[] =
      [];

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
    const filteredDay = project.perforations.filter(
      (p: any) =>
        (p.activity === "Rota" || p.activity === "Desliza") && p.shift === "Día"
    );
    const groupByDateDay: Record<string, { planned: number; real: number }> =
      {};
    for (const p of filteredDay) {
      if (!p.created_at) continue;
      const dateStr = new Date(p.created_at).toISOString().slice(0, 10);
      if (!groupByDateDay[dateStr]) {
        groupByDateDay[dateStr] = { planned: 0, real: 0 };
      }
      groupByDateDay[dateStr].planned += Number(p.pierced_feet_kpi ?? 0);
      groupByDateDay[dateStr].real += Number(p.drilled_meters ?? 0);
    }
    const drilledFeetDayLabels: string[] = [];
    const drilledFeetDayPlanned: number[] = [];
    const drilledFeetDayReal: number[] = [];
    const drilledFeetDayRaw: { date: string; planned: number; real: number }[] =
      [];
    for (const date of Object.keys(groupByDateDay).sort()) {
      drilledFeetDayLabels.push(date);
      drilledFeetDayPlanned.push(
        Number(groupByDateDay[date].planned.toFixed(2))
      );
      drilledFeetDayReal.push(Number(groupByDateDay[date].real.toFixed(2)));
      drilledFeetDayRaw.push({
        date,
        planned: Number(groupByDateDay[date].planned.toFixed(2)),
        real: Number(groupByDateDay[date].real.toFixed(2)),
      });
    }

    // Nueva gráfica: Pies Perforados Noche
    const filteredNight = project.perforations.filter(
      (p: any) =>
        (p.activity === "Rota" || p.activity === "Desliza") &&
        p.shift === "Noche"
    );
    const groupByDateNight: Record<string, { planned: number; real: number }> =
      {};
    for (const p of filteredNight) {
      if (!p.created_at) continue;
      const dateStr = new Date(p.created_at).toISOString().slice(0, 10);
      if (!groupByDateNight[dateStr]) {
        groupByDateNight[dateStr] = { planned: 0, real: 0 };
      }
      groupByDateNight[dateStr].planned += Number(p.pierced_feet_kpi ?? 0);
      groupByDateNight[dateStr].real += Number(p.drilled_meters ?? 0);
    }
    const drilledFeetNightLabels: string[] = [];
    const drilledFeetNightPlanned: number[] = [];
    const drilledFeetNightReal: number[] = [];
    const drilledFeetNightRaw: {
      date: string;
      planned: number;
      real: number;
    }[] = [];
    for (const date of Object.keys(groupByDateNight).sort()) {
      drilledFeetNightLabels.push(date);
      drilledFeetNightPlanned.push(
        Number(groupByDateNight[date].planned.toFixed(2))
      );
      drilledFeetNightReal.push(Number(groupByDateNight[date].real.toFixed(2)));
      drilledFeetNightRaw.push({
        date,
        planned: Number(groupByDateNight[date].planned.toFixed(2)),
        real: Number(groupByDateNight[date].real.toFixed(2)),
      });
    }

    // --- ROP PROMEDIO POR FECHA ---
    // Filtrar perforaciones válidas
    const ropFiltered = project.perforations.filter(
      (p: any) =>
        (p.activity === "Rota" || p.activity === "Desliza") && p.created_at
    );
    // Agrupar por fecha
    const ropGroupByDate: Record<
      string,
      { totalFeet: number; totalTime: number }
    > = {};
    for (const p of ropFiltered) {
      const dateStr = new Date(p.created_at).toISOString().slice(0, 10);
      if (!ropGroupByDate[dateStr]) {
        ropGroupByDate[dateStr] = { totalFeet: 0, totalTime: 0 };
      }
      ropGroupByDate[dateStr].totalFeet += Number(p.drilled_meters ?? 0);
      ropGroupByDate[dateStr].totalTime += Number(p.time ?? 0);
    }

    // Calcular ROP real y planeado por fecha
    const ropAvgLabels: string[] = [];
    const ropAvgReal: number[] = [];
    const ropAvgPlanned: number[] = [];
    const ropAvgRaw: { date: string; planned: number; real: number }[] = [];

    // Helper para buscar el rop planeado en el rango de rop_avg_kpi
    function getPlannedRop(depth: number): number {
      const arr = project.project_static_data?.rop_avg_kpi ?? [];
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
      const real =
        totalTime > 0 ? Number((totalFeet / totalTime).toFixed(2)) : 0;
      const planned = totalFeet > 0 ? getPlannedRop(totalFeet) : 0;
      ropAvgLabels.push(date);
      ropAvgReal.push(real);
      ropAvgPlanned.push(planned);
      ropAvgRaw.push({ date, planned, real });
    }

    // --- ROP ROTADO POR TURNOS ---
    // Filtrar perforaciones válidas (solo "Rota")
    const rotaFiltered = project.perforations.filter(
      (p: any) => p.activity === "Rota" && p.created_at
    );
    // Agrupar por fecha y turno
    const rotaGroupByDate: Record<
      string,
      { dayFeet: number; dayTime: number; nightFeet: number; nightTime: number }
    > = {};
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
        rotaGroupByDate[dateStr].dayFeet += Number(p.drilled_meters ?? 0);
        rotaGroupByDate[dateStr].dayTime += Number(p.time ?? 0);
      } else if (p.shift === "Noche") {
        rotaGroupByDate[dateStr].nightFeet += Number(p.drilled_meters ?? 0);
        rotaGroupByDate[dateStr].nightTime += Number(p.time ?? 0);
      }
    }

    const ropRotatedLabels: string[] = [];
    const ropRotatedDay: number[] = [];
    const ropRotatedNight: number[] = [];
    const ropRotatedKpi: number[] = [];
    const ropRotatedRaw: {
      date: string;
      ropDay: number;
      ropNight: number;
      ropKpi: number;
    }[] = [];

    for (const date of Object.keys(rotaGroupByDate).sort()) {
      const { dayFeet, dayTime, nightFeet, nightTime } = rotaGroupByDate[date];
      const ropDay = dayTime > 0 ? Number((dayFeet / dayTime).toFixed(2)) : 0;
      const ropNight =
        nightTime > 0 ? Number((nightFeet / nightTime).toFixed(2)) : 0;
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
      .filter((p: any) => p.activity == "Repasa")
      .map((p: any, idx: number) => ({ ...p._doc, index: idx + 1 }));

    const reviewLabels: number[] = [];
    const reviewTime: number[] = [];
    const reviewDay: number[] = [];
    const reviewNight: number[] = [];
    const reviewKpi: number[] = [];
    const reviewRaw: {
      index: number;
      time: number;
      shift: string;
      kpi: number;
    }[] = [];

    const reviewKpiValue =
      project.project_static_data?.review_kpi?.[0]?.time ?? 0;

    for (const p of reviewFiltered) {
      reviewLabels.push(p.index);
      reviewTime.push(Number(p.time ?? 0));
      if (p.shift === "Día") {
        reviewDay.push(Number(p.time ?? 0));
        reviewNight.push(0);
      } else if (p.shift === "Noche") {
        reviewDay.push(0);
        reviewNight.push(Number(p.time ?? 0));
      } else {
        reviewDay.push(0);
        reviewNight.push(0);
      }
      reviewKpi.push(Number(reviewKpiValue));
      reviewRaw.push({
        index: p.index,
        time: Number(p.time ?? 0),
        shift: p.shift ?? "",
        kpi: Number(reviewKpiValue),
      });
    }

    // --- TIEMPOS DE SURVEY POR TURNO ---
    const surveyFiltered = await project.perforations
      .filter((p: any) => p.activity == "Survey")
      .map((p: any, idx: number) => ({ ...p._doc, index: idx + 1 }));

    const surveyLabels: number[] = [];
    const surveyTime: number[] = [];
    const surveyDay: number[] = [];
    const surveyNight: number[] = [];
    const surveyKpi: number[] = [];
    const surveyRaw: {
      index: number;
      time: number;
      shift: string;
      kpi: number;
    }[] = [];

    const surveyKpiValue =
      project.project_static_data?.survey_kpi?.[0]?.time ?? 0;

    for (const p of surveyFiltered) {
      surveyLabels.push(p.index);
      surveyTime.push(Number(p.time ?? 0));
      if (p.shift === "Día") {
        surveyDay.push(Number(p.time ?? 0));
        surveyNight.push(0);
      } else if (p.shift === "Noche") {
        surveyDay.push(0);
        surveyNight.push(Number(p.time ?? 0));
      } else {
        surveyDay.push(0);
        surveyNight.push(0);
      }
      surveyKpi.push(Number(surveyKpiValue));
      surveyRaw.push({
        index: p.index,
        time: Number(p.time ?? 0),
        shift: p.shift ?? "",
        kpi: Number(surveyKpiValue),
      });
    }

    // --- TIEMPOS DE CONEXIÓN POR TURNO ---
    const conexionFiltered = await project.perforations
      .filter((p: any) => p.activity == "Conexión")
      .map((p: any, idx: number) => ({ ...p._doc, index: idx + 1 }));

    const conexionLabels: number[] = [];
    const conexionTime: number[] = [];
    const conexionDay: number[] = [];
    const conexionNight: number[] = [];
    const conexionKpi: number[] = [];
    const conexionRaw: {
      index: number;
      time: number;
      shift: string;
      kpi: number;
    }[] = [];

    // Helper para buscar el KPI de conexión por depth_from
    function getConexionKpi(depth: number): number {
      const arr = project.project_static_data?.conex_kpi ?? [];
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
      return Number(kpiValue ?? 0);
    }

    for (const p of conexionFiltered) {
      conexionLabels.push(p.index);
      conexionTime.push(Number(p.time ?? 0));
      if (p.shift === "Día") {
        conexionDay.push(Number(p.time ?? 0));
        conexionNight.push(0);
      } else if (p.shift === "Noche") {
        conexionDay.push(0);
        conexionNight.push(Number(p.time ?? 0));
      } else {
        conexionDay.push(0);
        conexionNight.push(0);
      }
      // Buscar el KPI por depth_from
      const kpiValue = getConexionKpi(p.depth_from ?? 0);
      conexionKpi.push(Number(kpiValue));
      conexionRaw.push({
        index: p.index,
        time: Number(p.time ?? 0),
        shift: p.shift ?? "",
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

  public async updateProject(
    projectId: string,
    updateData: Partial<any>
  ): Promise<any> {
    if (!projectId) throw new Error("Project ID is required");
    const project = await this.proyects.findById(projectId);
    if (!project) throw new Error("Project not found");

    console.log("Update Data:", updateData);

    // Actualizar todos los campos del DTO si están presentes en updateData
    Object.assign(project, updateData);
    project.has_changes = new Date();
    await project.save();
    return project;
  }

  public async deleteProject(projectId: string): Promise<any> {
    if (!projectId) throw new Error("Project ID is required");
    const project = await this.proyects.findByIdAndDelete(projectId);
    if (!project) throw new Error("Project not found");
    return { _id: projectId, deleted: true };
  }

  public async resetProjectChanges(projectId: string): Promise<void> {
    await this.proyects.findByIdAndUpdate(projectId, { has_changes: false });
  }
}

export default ProjectService;
