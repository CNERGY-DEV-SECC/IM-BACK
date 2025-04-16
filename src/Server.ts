import Fastify from "fastify";

const fastify = Fastify({ logger: true });

const port = 3000;

fastify.get("/", async (request, reply) => {
  return { message: "Hello from Fastify + TypeScript!" };
});

fastify.post("/echo", async (request, reply) => {
  return {
    message: "You sent:",
    data: request.body,
  };
});

const start = async () => {
  try {
    await fastify.listen({ port });
    console.log(`🚀 Server listening at http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
