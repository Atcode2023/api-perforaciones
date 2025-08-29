import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';
import authMiddleware from '../middlewares/auth.middleware';
import validationMiddleware from '../middlewares/validation.middleware';
import GeomechanicController from '../controllers/geomechanic.controller';
import { CreateGeomechanicDto, UpdateGeomechanicDto } from '../dtos/geomechanic.dto';

class GeomechanicRoute implements Routes {
  public path = '/geomechanics';
  public router = Router();
  public controller = new GeomechanicController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, authMiddleware, this.controller.list);
    this.router.get(`${this.path}/:id`, authMiddleware, this.controller.get);
    this.router.post(
      this.path,
      authMiddleware,
      this.coerceMultipartNumericFields,
  // Desactivar forbidNonWhitelisted temporalmente para depurar
  validationMiddleware(CreateGeomechanicDto, 'body', false, true, false),
      this.controller.create
    );
    this.router.put(
      `${this.path}/:id`,
      authMiddleware,
      this.coerceMultipartNumericFields,
  validationMiddleware(UpdateGeomechanicDto, 'body', false, true, false),
      this.controller.update
    );
    this.router.delete(`${this.path}/:id`, authMiddleware, this.controller.delete);
  }

  // Convierte strings de multipart a tipos adecuados antes de validar
  private coerceMultipartNumericFields = (req: any, _res: any, next: any) => {
    const numericFields = [
      'lag_depth_ft',
  'morphology_normal_pct',
      'morphology_retrab_pct',
      'morphology_angular_pct',
      'morphology_tabular_pct',
      'morphology_astilloso_pct',
  'min_mm',
  'max_mm',
  'avg_mm',
  'cuttings_rate_bph',
  'excess_deficit_bbl',
  'mw_lpg',
  'ecd_lpg'
    ];
    numericFields.forEach(f => {
      if (req.body && req.body[f] !== undefined && req.body[f] !== '') {
        const n = Number(req.body[f]);
        if (!Number.isNaN(n)) req.body[f] = n;
      }
    });
    if (req.body && typeof req.body.derrumbes === 'string') {
      req.body.derrumbes = ['true', '1', 'on', 'si', 'sí', 'SI'].includes(req.body.derrumbes.toLowerCase());
    }
    if (req.body && typeof req.body.lithologies === 'string') {
      try { req.body.lithologies = JSON.parse(req.body.lithologies); } catch {}
    }
    next();
  };

  
}

export default GeomechanicRoute;
