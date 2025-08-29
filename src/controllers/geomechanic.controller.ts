import { Request, Response, NextFunction } from 'express';
import GeomechanicService from '../services/geomechanic.service';

class GeomechanicController {
  public service = new GeomechanicService();

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = (req as any).files?.find((f: any) => f.fieldname === 'image');
      if (typeof (req.body as any).lithologies === 'string') {
        try { (req.body as any).lithologies = JSON.parse((req.body as any).lithologies); } catch {}
      }
  // Ahora lithologies sólo incluye {name, present}; métricas globales vienen en body raíz
      const doc = await this.service.create(req.body, file);
      res.status(201).json({ data: doc, message: 'Registro geomecánico creado' });
    } catch (e) {
      next(e);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: any = {};
      if (req.query.project) filter.project = req.query.project;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;

      if (page || limit || search) {
        const result = await this.service.findPaginated(filter, { page, limit, search });
        res.status(200).json({
          data: result.results,
            page: result.page,
            limit: result.limit,
            total: result.totalResults,
            totalPages: result.totalPages,
            message: 'list',
        });
      } else {
        const docs = await this.service.findAll(filter);
        res.status(200).json({ data: docs, message: 'list' });
      }
    } catch (e) {
      next(e);
    }
  };

  public get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doc = await this.service.findById(req.params.id);
      res.status(200).json({ data: doc, message: 'get' });
    } catch (e) {
      next(e);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = (req as any).files?.find((f: any) => f.fieldname === 'image');
      if (typeof (req.body as any).lithologies === 'string') {
        try { (req.body as any).lithologies = JSON.parse((req.body as any).lithologies); } catch {}
      }
  // Actualización con nueva estructura simplificada
      const doc = await this.service.update(req.params.id, req.body, file);
      res.status(200).json({ data: doc, message: 'updated' });
    } catch (e) {
      next(e);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ok = await this.service.remove(req.params.id);
      res.status(200).json({ deleted: ok, message: 'deleted' });
    } catch (e) {
      next(e);
    }
  };
}

export default GeomechanicController;
