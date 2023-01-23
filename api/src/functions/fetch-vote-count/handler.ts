import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { load } from 'ts-dotenv';
import { createConnection } from 'mysql2/promise';

const env = load({
  DATABASE_URL: String,
});

const fetchVoteCount = async (event: APIGatewayProxyEvent) => {
  const connection = await createConnection(env.DATABASE_URL);
  const [rows, _] = await connection.execute(
    'select count(*) as count from vote_histories where device_id = ? group by device_id;',
    [
      event.pathParameters.id
    ]);
  return formatJSONResponse({
    count: rows[0]?.count ?? 0,
  });
};

export const main = middyfy(fetchVoteCount);
