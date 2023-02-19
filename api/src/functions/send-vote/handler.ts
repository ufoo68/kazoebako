import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { load } from 'ts-dotenv';
import * as mongoDB from 'mongodb';

const env = load({
  DB_CONN_STRING: String,
});
const sendVote = async (event: APIGatewayProxyEvent) => {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(env.DB_CONN_STRING);
  await client.connect();
  const db: mongoDB.Db = client.db('kazoebako');
  const voteHistoryCollection: mongoDB.Collection = db.collection('voteHistory');
  console.log(`Successfully connected to database: ${db.databaseName} and collection: ${voteHistoryCollection.collectionName}`);
  await voteHistoryCollection.insertOne({ deviceId: Number(event.pathParameters.id) });
  return formatJSONResponse({});
};

export const main = middyfy(sendVote);
