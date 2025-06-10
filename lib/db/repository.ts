import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
  WithFieldValue,
  Firestore
} from 'firebase/firestore';
import { getDb } from './index';

export abstract class BaseRepository<T extends { id: string }> {
  protected db: Firestore;
  protected abstract collectionName: string;

  constructor() {
    this.db = getDb();
  }

  protected get collectionRef() {
    return collection(this.db, this.collectionName);
  }

  async findById(id: string): Promise<T | null> {
    const docRef = doc(this.db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as T;
  }

  async findAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(this.collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const docRef = await addDoc(this.collectionRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    } as WithFieldValue<DocumentData>);

    return {
      id: docRef.id,
      ...data
    } as T;
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    } as WithFieldValue<DocumentData>);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  protected createQueryConstraints(
    filters: Record<string, any>,
    orderByField?: string,
    limitTo?: number
  ): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];

    // Add filters
    Object.entries(filters).forEach(([field, value]) => {
      if (value !== undefined && value !== null) {
        constraints.push(where(field, '==', value));
      }
    });

    // Add ordering
    if (orderByField) {
      constraints.push(orderBy(orderByField));
    }

    // Add limit
    if (limitTo) {
      constraints.push(limit(limitTo));
    }

    return constraints;
  }
} 