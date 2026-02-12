import { getApiClient, ApiError } from "@vessel/network";
import { Collection } from "../types/request";

export interface ICollectionService {
  fetchCollections(): Promise<Collection[]>;
  syncCollection(collection: Collection): Promise<void>;
  deleteCollection(id: string): Promise<void>;
}

/**
 * Service for collection sync API calls.
 * Uses the singleton ApiClient — token is auto-injected.
 */
class CollectionService implements ICollectionService {
  async fetchCollections(): Promise<Collection[]> {
    const client = getApiClient();
    const response = await client.get<Collection[]>("/collections");
    return response.data;
  }

  async syncCollection(collection: Collection): Promise<void> {
    const client = getApiClient();
    await client.post("/collections/sync", collection);
  }

  async deleteCollection(id: string): Promise<void> {
    const client = getApiClient();
    try {
      await client.delete(`/collections/${id}`);
    } catch (error) {
      // Silently ignore 404 — collection may already be deleted remotely
      if (error instanceof ApiError && error.status === 404) {
        return;
      }
      throw error;
    }
  }
}

export const collectionService = new CollectionService();
