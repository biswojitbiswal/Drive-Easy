import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function Pagination(searchFields: string[] = []) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [dto, modelName, queryOptions = {}] = args;

      const page = parseInt(dto.page) || 1;
      const limit = parseInt(dto.limit) || null;
      const shouldPaginate = dto.page || dto.limit;
      const type = dto.type

      if (shouldPaginate) {
        const actualLimit = limit || 10;
        const skip = (page - 1) * actualLimit;
        queryOptions.skip = skip;
        queryOptions.take = actualLimit;
      }

      const prismaInstance = this.prismaService || this.prisma;
      if (!prismaInstance || !prismaInstance[modelName]) {
        throw new Error(`Invalid Prisma model: ${modelName}. Available properties: ${Object.keys(prismaInstance || {}).join(', ')}`);
      }

      const where: any = {};


      if (dto.search && dto.search.trim() !== '' && searchFields.length > 0) {
        const value = dto.search.trim();
        const orConditions: any[] = [];

        const sample = await prismaInstance[modelName].findFirst();
        if (sample) {
          for (const field of searchFields) {
            const sampleValue = sample[field];

            if (typeof sampleValue === 'string') {
              orConditions.push({
                [field]: {
                  contains: value,
                  mode: 'insensitive',
                },
              });
            } else if (typeof sampleValue === 'number') {
              const number = Number(value);
              if (!isNaN(number)) {
                orConditions.push({ [field]: number });
              }
            } else if (sampleValue instanceof Date) {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                orConditions.push({ [field]: date });
              }
            }
          }

          if (orConditions.length > 0) {
            if (!queryOptions.where) queryOptions.where = {};
            queryOptions.where.OR = orConditions;
          }
        }
      }

      if (dto.type) {
        where.type = dto.type
      }

      if (dto.fuel) {
        where.fuel = dto.fuel;
      }

      if (dto.transmission) {
        where.transmission = dto.transmission;
      }

      if (dto.seats) {
        where.seats = parseInt(dto.seats)
      }

      if (dto.isAvailable !== undefined) {
        const val = String(dto.isAvailable).toLowerCase();
        if (val === 'true') where.isAvailable = true;
        else if (val === 'false') where.isAvailable = false;
      }

      if (dto.priceRange) {
        where.pricePerDay = {
          lte: Number(dto.priceRange)
        }
      }

      queryOptions.where = queryOptions.where
        ? { ...queryOptions.where, ...where }
        : where;

      // Sorting
      if (dto.sortOrder) {
        queryOptions.orderBy = {
          pricePerDay: dto.sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc',
        };
      }

      const [total, data] = await Promise.all([
        prismaInstance[modelName].count({ where: queryOptions.where }),
        prismaInstance[modelName].findMany(queryOptions),
      ]);

      return {
        total,
        page,
        limit: shouldPaginate ? (limit || 10) : null,
        data,
      };
    };

    return descriptor;
  };
}
