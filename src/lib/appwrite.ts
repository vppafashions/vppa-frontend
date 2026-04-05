import { Client, Account, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '69aaa3a900228aff9ae5');

export const account = new Account(client);
export const databases = new Databases(client);
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '69aaa3c3001805a8a9ef';
export const CUSTOMERS_COLLECTION_ID = 'customers';
export const CARTS_COLLECTION_ID = 'carts';
export { client };
