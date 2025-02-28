import { Client } from "@upstash/workflow";

const client = new Client({ token: process.env.QSTASH_TOKEN });

export const workflow = client;
