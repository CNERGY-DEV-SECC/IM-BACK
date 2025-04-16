import Fastify from "fastify";
import jwt from "@fastify/jwt";
import bcrypt from "bcryptjs";

const fastify = Fastify({ logger: true });


fastify.register(jwt, {
  secret: "supersecret", 
});

const users: { id: number; username: string; passwordHash: string }[] = [];
let idCounter = 1;

fastify.post("/register", async (request, reply) => {
  const { username, password } = request.body as any;

  if (!username || !password) {
    return reply.status(400).send({ error: "Username and password required" });
  }

  const existing = users.find((u) => u.username === username);
  if (existing) {
    return reply.status(409).send({ error: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = { id: idCounter++, username, passwordHash };
  users.push(newUser);

  return reply.send({ message: "User registered" });
});

// Login endpoint
fastify.post("/login", async (request, reply) => {
  const { username, password } = request.body as any;

  const user = users.find((u) => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return reply.status(401).send({ error: "Invalid credentials" });
  }

  const token = fastify.jwt.sign({ id: user.id, username: user.username });
  return reply.send({ token });
});

// Authenticated route
fastify.get("/profile", async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) throw new Error("Missing token");

    const token = authHeader.replace("Bearer ", "");
    const decoded = await fastify.jwt.verify(token);

    const user = users.find((u) => u.id === decoded.id);
    if (!user) throw new Error("User not found");

    return { id: user.id, username: user.username };
  } catch (err) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log("🚀 Auth API running on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
