import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.

declare const globalThis: {
    prisma: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const dbClient = globalThis.prisma ?? prismaClientSingleton()

export default dbClient;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = dbClient
