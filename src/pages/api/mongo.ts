import { MongoClient, MongoClientOptions, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const connectionString = publicRuntimeConfig.MONGO_URL;
const dbName = publicRuntimeConfig.MONGO_DB_NAME
const collectionName = publicRuntimeConfig.COLLECTION_NAME;

const options: MongoClientOptions = {
  retryWrites: true,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const client = new MongoClient(connectionString, options);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    switch (req.method) {
      case "GET":
        let query1 = {uniqueId:req.query.unique}
        const documents = await collection.find(query1).toArray();
        res.status(200).json({ data: documents });
        break;

      case "POST":
        const newDocument = req.body;
        const result = await collection.insertOne(newDocument);
        newDocument._id = result.insertedId;
        res.status(201).json({ data: newDocument });
        break;

      case "PUT":
        let query = {uniqueId:req.query.unique}
        let payload = req.body
        let payload1 = {
          uniqueId : payload.uniqueId,
          question:payload.question,
          answer:payload.answer,
          rating:payload.rating
        }
        const updateResult = await collection.updateOne(
          query,
          { $set: payload1 }
        );
        res.status(200).json({ data: updateResult.modifiedCount });
        break;

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};

export default handler;