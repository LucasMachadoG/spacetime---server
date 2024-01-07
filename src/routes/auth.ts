import { FastifyInstance } from "fastify";
import { z } from "zod";
import axios from 'axios'
import { prisma } from "../lib/prisma";

export async function authRoutes(app: FastifyInstance){
  app.post('/register', async (request) => {
    const bodySchema = z.object({
      code: z.string()
    })

    const { code } = bodySchema.parse(request.body)

    const accessTokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      null, 
      //Terceiro parametro sao as configurações da minha requisição
      {
        //Esses params sao os parametros qua vao na minha URL
        params: {
          code,
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET
        },
        //O accept vai servir para eu dizer para o github qual o formato da resposta que eu quero que ele me de
        headers: {
          Accept: 'application/json'
        }
      }
    )

    const { access_token } = accessTokenResponse.data

    const userResponse = await axios.get('https://github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })

    const userSchema = z.object({
      id: z.string(),
      login: z.string(),
      nome: z.string(),
      avatarURL: z.string().url()
    })

    const userInfo = userSchema.parse(userResponse.data)

    let user = await prisma.user.findUnique({
      where: {
        githubId: userInfo.id
      }
    })

    if(!user){
      user = await prisma.user.create({
        data: {
          githubId: userInfo.id,
          login: userInfo.login,
          nome: userInfo.nome,
          avatarUrl: userInfo.avatarURL
        }
      })
    }

    const token = app.jwt.sign({
      nome: user.nome,
      avatarURL: user.avatarUrl
    }, {
      sub: user.id,
      expiresIn: '30 days'
    })

    return {
      token
    }
  })
}