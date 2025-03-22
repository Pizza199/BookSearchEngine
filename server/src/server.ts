import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import db from './config/connection.js';
import routes from './routes/index.js';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from './schemas/typeDefs.js'; 
import resolvers from './schemas/resolvers.js';
import cors from 'cors';
import { authenticateToken } from './services/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
}

async function startServer() {


const server=new ApolloServer({
typeDefs, resolvers,
context: authenticateToken
//context: ({ req }) => ({ user: req.user })
  
})
await server.start();
server.applyMiddleware({ app: app as any });
app.use(cors());
app.use(routes);
db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}${server.graphqlPath}`));
});
}

startServer().catch(err => console.error(err));