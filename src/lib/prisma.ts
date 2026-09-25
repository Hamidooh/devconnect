import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const urlToUse = process.env.DATABASE_URL && process.env.DATABASE_URL !== 'undefined' ? process.env.DATABASE_URL : 'file:./dev.db';

const adapter = new PrismaLibSql({
  url: urlToUse
})

const globalForPrisma = globalThis as unknown as { prisma_story?: PrismaClient }

export const prisma = globalForPrisma.prisma_story || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_story = prisma
