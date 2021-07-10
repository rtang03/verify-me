require('dotenv').config();
import http from 'http';
import util from 'util';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { json, urlencoded } from 'express';
import morgan from 'morgan';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const port = parseInt(process.env.PORT || '3000', 10);

app
  .prepare()
  .then(async () => {
    const server = express();
    server.use(json());
    server.use(urlencoded({ extended: true }));
    server.use(cookieParser());
    server.use(morgan('dev'));
    server.use(cors({ origin: '*' }));

    server.use((req, res) => app.getRequestHandler()(req, res));

    http.createServer(server).listen(port, () => {
      console.log(`server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error(util.format('❌  fail to start nextjs server, %j', error));
    process.exit(1);
  });
