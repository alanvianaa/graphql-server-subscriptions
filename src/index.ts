import {createServer} from 'http';
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';
import {makeExecutableSchema} from '@graphql-tools/schema';
import {WebSocketServer} from 'ws';
import {useServer} from 'graphql-ws/lib/use/ws';

import {ApolloServer} from '@apollo/server';
import {resolvers} from "./resolver.js";
import path from "node:path";
import * as fs from "fs";

import express from 'express';
import {expressMiddleware} from "@apollo/server/express4";
import bodyParser from 'body-parser';

const typeDefs = fs.readFileSync(path.resolve('src/schema.graphql'), {encoding: 'utf8', flag: 'r',}).toString();
const app = express();
const httpServer = createServer(app);

const schema = makeExecutableSchema({typeDefs, resolvers});

const server = new ApolloServer({
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({httpServer}),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    },
                };
            },
        },
    ],
});

const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/subscriptions',
});

const serverCleanup = useServer({schema}, wsServer);
await server.start();
app.use('/subscriptions', bodyParser.json(), expressMiddleware(server));

await new Promise<void>((resolve) => httpServer.listen({port: 4000}, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);