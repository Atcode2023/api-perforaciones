import geomechanicModel, { GeomechanicProject } from '../models/geomechanic.model';
import path from 'path';
import fs from 'fs';

class GeomechanicService {
  public model = geomechanicModel;

  public async create(data: any, file?: any): Promise<GeomechanicProject> {
  // data.lithologies ahora sólo contiene { name, present }
    if (file) data.image_url = await this.persistImage(file);
    const doc = await this.model.create(data);
    return doc;
  }

  public async update(id: string, data: any, file?: any): Promise<GeomechanicProject | null> {
    const doc = await this.model.findById(id);
    if (!doc) return null;
    if (file) data.image_url = await this.persistImage(file);
  // Merge de campos globales y lista simple de litologías
    Object.assign(doc, data);
    await doc.save();
    return doc;
  }

  public async remove(id: string): Promise<boolean> {
    const res = await this.model.findByIdAndDelete(id);
    return !!res;
  }

  public async findAll(filter: any = {}): Promise<GeomechanicProject[]> {
    return this.model.find(filter).sort({ created_at: -1 }).lean();
  }

  /**
   * Paginated list with optional text search across section, event and remarks.
   */
  public async findPaginated(
    filter: any = {},
    options: { page?: number; limit?: number; search?: string }
  ): Promise<{
    results: GeomechanicProject[];
    page: number;
    limit: number;
    totalResults: number;
    totalPages: number;
  }> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const rawSearch = (options.search || '').trim();
    if (rawSearch) {
      // Escapar caracteres especiales de regex para emular un LIKE '%term%'
      const escaped = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      // Solo se busca por sección y evento (patrón similar a búsqueda de proyectos)
      filter.$or = [{ section: { $regex: regex } }, { event: { $regex: regex } }];
    }

    const [totalResults, results] = await Promise.all([
      this.model.countDocuments(filter),
      this.model
        .find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);
    const totalPages = Math.ceil(totalResults / limit) || 1;
    return { results, page, limit, totalResults, totalPages };
  }

  public async findById(id: string): Promise<GeomechanicProject | null> {
    return this.model.findById(id).lean();
  }

  private async persistImage(file: any): Promise<string> {
    const uploadsDir = path.join(__dirname, '../../public/geomechanics');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, file.buffer);
    return `geomechanics/${filename}`; // relative path served by express static
  }
}

export default GeomechanicService;
