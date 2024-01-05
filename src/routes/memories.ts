import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from 'zod'

export async function memoriesRoutes(app:FastifyInstance) {
  app.get('/memories', async () => {
    const memories = await prisma.memory.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    })

    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.conteudo.substring(0, 115). concat('...')
      }
    })
  })

  app.get('/memories:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = paramsSchema.parse(request.params)

    const memory = prisma.memory.findUniqueOrThrow({
      where: {
        id
      }
    })

    return memory
  })

//coerce vai converter o valor que chegar nesse isPublic para boolean

  app.post('/memories', async (request) => {
    const bodySchema = z.object({
      conteudo: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false)
    })

    const { conteudo, coverUrl, isPublic } = bodySchema.parse(request.body)

    const memory = await prisma.memory.create({
      data: {
        conteudo,
        coverUrl,
        isPublic,
        userId: '27e9dc75-6534-468d-9309-67f8fc590f0f'
      }
    })

    return memory
  })

  app.put('/memories:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid()
    })
  
    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      conteudo: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false)
    })

    const { conteudo, coverUrl, isPublic } = bodySchema.parse(request.body)

    const memory = await prisma.memory.update({
      where: {
        id
      }, 
      data: {
        conteudo,
        coverUrl,
        isPublic
      }
    })

    return memory
  })
  
  app.delete('/memories:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = paramsSchema.parse(request.params)

    await prisma.memory.delete({
      where: {
        id
      }
    })
  })
}