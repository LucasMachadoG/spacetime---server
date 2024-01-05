import fastify from "fastify";
import cors from "@fastify/cors"
import { memoriesRoutes } from "./routes/memories";

const app = fastify()

//Esse metodo do fastify serve para registrar um arquivo de rotas separado
app.register(memoriesRoutes)
app.register(cors, { 
  origin: true, //Todas as URLs de front-end podem acessar nosso back-end
 })

app.listen({
  port: 3333
}).then(() => {
  console.log(`😎 API is running on the port 3333`)
})