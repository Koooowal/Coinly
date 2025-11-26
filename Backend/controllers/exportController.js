
import * as exportService from '../services/exportService.js';
import { formatResponse } from '../utils/responseFormatter.js';


export const exportMonthly = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { year, month, format = 'csv' } = req.query;

    if (!year || !month) {
      return res.status(400).json(formatResponse(false, 'Year and month are required'));
    }

    const data = await exportService.getMonthlyData(userId, parseInt(year), parseInt(month));

    switch (format.toLowerCase()) {
      case 'csv':
        const csv = exportService.convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="transactions_${year}_${month}.csv"`);
        return res.send(csv);

      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="transactions_${year}_${month}.json"`);
        return res.json(data);

      case 'excel':
      case 'xlsx':
        const excel = await exportService.convertToExcel(data, `Transactions ${month}/${year}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="transactions_${year}_${month}.xlsx"`);
        return res.send(excel);

      default:
        return res.status(400).json(formatResponse(false, 'Invalid format. Use: csv, json, or excel'));
    }
  } catch (error) {
    next(error);
  }
};


export const exportYearly = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { year, format = 'csv' } = req.query;

    if (!year) {
      return res.status(400).json(formatResponse(false, 'Year is required'));
    }

    const data = await exportService.getYearlyData(userId, parseInt(year));

    switch (format.toLowerCase()) {
      case 'csv':
        const csv = exportService.convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="transactions_${year}.csv"`);
        return res.send(csv);

      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="transactions_${year}.json"`);
        return res.json(data);

      case 'excel':
      case 'xlsx':
        const excel = await exportService.convertToExcel(data, `Transactions ${year}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="transactions_${year}.xlsx"`);
        return res.send(excel);

      default:
        return res.status(400).json(formatResponse(false, 'Invalid format. Use: csv, json, or excel'));
    }
  } catch (error) {
    next(error);
  }
};


export const exportRange = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { start_date, end_date, format = 'csv' } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json(formatResponse(false, 'start_date and end_date are required'));
    }

    const data = await exportService.getRangeData(userId, start_date, end_date);

    const filename = `transactions_${start_date}_to_${end_date}`;

    switch (format.toLowerCase()) {
      case 'csv':
        const csv = exportService.convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        return res.send(csv);

      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        return res.json(data);

      case 'excel':
      case 'xlsx':
        const excel = await exportService.convertToExcel(data, `Transactions ${start_date} to ${end_date}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
        return res.send(excel);

      default:
        return res.status(400).json(formatResponse(false, 'Invalid format. Use: csv, json, or excel'));
    }
  } catch (error) {
    next(error);
  }
};