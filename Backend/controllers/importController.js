
import * as importService from '../services/importService.js';
import { formatResponse } from '../utils/responseFormatter.js';
import multer from 'multer';
import path from 'path';


const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.json', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, JSON, and Excel files are allowed.'));
    }
  }
}).single('file');


export const importTransactions = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json(formatResponse(false, err.message));
    }

    if (!req.file) {
      return res.status(400).json(formatResponse(false, 'No file uploaded'));
    }

    try {
      const userId = req.user.id;
      const file = req.file;
      const ext = path.extname(file.originalname).toLowerCase();

      let parsedData;

      
      switch (ext) {
        case '.csv':
          parsedData = await importService.parseCSV(file.buffer);
          break;

        case '.json':
          parsedData = importService.parseJSON(file.buffer);
          break;

        case '.xlsx':
        case '.xls':
          parsedData = await importService.parseExcel(file.buffer);
          break;

        default:
          return res.status(400).json(formatResponse(false, 'Unsupported file format'));
      }

      
      const validation = importService.validateData(parsedData);
      if (!validation.valid) {
        return res.status(400).json(formatResponse(false, 'Invalid data format', {
          errors: validation.errors
        }));
      }

    
      const result = await importService.importTransactions(userId, parsedData);

      res.json(formatResponse(true, 'Transactions imported successfully', {
        total: parsedData.length,
        imported: result.imported,
        failed: result.failed,
        errors: result.errors
      }));

    } catch (error) {
      next(error);
    }
  });
};


export const previewImport = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json(formatResponse(false, err.message));
    }

    if (!req.file) {
      return res.status(400).json(formatResponse(false, 'No file uploaded'));
    }

    try {
      const file = req.file;
      const ext = path.extname(file.originalname).toLowerCase();

      let parsedData;

 
      switch (ext) {
        case '.csv':
          parsedData = await importService.parseCSV(file.buffer);
          break;

        case '.json':
          parsedData = importService.parseJSON(file.buffer);
          break;

        case '.xlsx':
        case '.xls':
          parsedData = await importService.parseExcel(file.buffer);
          break;

        default:
          return res.status(400).json(formatResponse(false, 'Unsupported file format'));
      }


      const validation = importService.validateData(parsedData);

      res.json(formatResponse(true, 'Preview generated', {
        total: parsedData.length,
        valid: validation.valid,
        errors: validation.errors,
        preview: parsedData.slice(0, 10) 
      }));

    } catch (error) {
      next(error);
    }
  });
};


export const downloadTemplate = async (req, res, next) => {
  try {
    const { format = 'csv' } = req.query;

    const template = importService.generateTemplate(format);

    switch (format.toLowerCase()) {
      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="import_template.csv"');
        return res.send(template);

      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="import_template.json"');
        return res.send(template);

      case 'excel':
      case 'xlsx':
        const excel = await importService.generateExcelTemplate();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="import_template.xlsx"');
        return res.send(excel);

      default:
        return res.status(400).json(formatResponse(false, 'Invalid format. Use: csv, json, or excel'));
    }
  } catch (error) {
    next(error);
  }
};