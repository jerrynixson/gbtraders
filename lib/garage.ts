import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { 
  uploadBytes, 
  getDownloadURL, 
  ref, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './firebase';

// Garage type definition matching the existing interface
export interface Garage {
  id: string;
  name: string;
  address: string;
  phone: string;
  image: string;
  coverImage?: string;
  price: string;
  description: string;
  services: string[];
  rating: number;
  location?: {
    addressLines: [string, string, string, string]; // 4th element for postcode
    lat: number;
    long: number;
  };
  openingHours: {
    weekdays: { start: string; end: string };
    saturday: { start: string; end: string };
    sunday: { start: string; end: string };
  };
  website: string;
  email: string;
  paymentMethods: string[];
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

// Firestore document structure (what gets saved to database)
export interface GarageDocument {
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: { lat: number; lng: number };
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  services: string[];
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  image?: string;
  coverImage?: string;
  price?: string;
  paymentMethods?: string[];
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  rating?: number;
}

// Image upload functions
export const uploadGarageImage = async (file: File, garageId: string, imageType: 'main' | 'cover' = 'main'): Promise<string> => {
  try {
    // Create a reference to the garage image in Firebase Storage
    const imageRef = ref(storage, `garages/${garageId}/${imageType}_image_${Date.now()}`);
    
    // Upload the file
    const snapshot = await uploadBytes(imageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading garage image:', error);
    throw new Error('Failed to upload image');
  }
};

export const deleteGarageImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the file path from the URL and delete it
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting garage image:', error);
    // Don't throw error for image deletion failures to avoid blocking other operations
  }
};

// Function to convert form data to Firestore document
export const convertGarageToDocument = (garage: Partial<Garage>, userId: string): Omit<GarageDocument, 'createdAt' | 'updatedAt'> => {
  // Handle location data - prefer new location structure, fallback to old address format
  let locationData;
  if (garage.location && garage.location.addressLines[0]) {
    // Use new location structure
    locationData = {
      address: garage.location.addressLines.join(', '),
      city: garage.location.addressLines[2] || '', // City/Town is in addressLines[2]
      state: garage.location.addressLines[1] || '', // District/Area is in addressLines[1]
      zipCode: garage.location.addressLines[3] || '', // Postcode is in addressLines[3]
      coordinates: garage.location.lat && garage.location.long ? {
        lat: garage.location.lat,
        lng: garage.location.long
      } : undefined
    };
  } else {
    // Fallback to old address format for backward compatibility
    const addressParts = (garage.address || '').split(',').map(part => part.trim());
    const city = addressParts.length > 1 ? addressParts[addressParts.length - 2] : '';
    const state = addressParts.length > 2 ? addressParts[addressParts.length - 3] : '';
    const zipCode = addressParts.length > 0 ? addressParts[addressParts.length - 1] : '';
    
    locationData = {
      address: garage.address || '',
      city,
      state,
      zipCode
    };
  }

  const result: any = {
    name: garage.name || '',
    description: garage.description || '',
    location: locationData,
    contact: {
      phone: garage.phone || '',
      email: garage.email || '',
      website: garage.website || undefined
    },
    services: garage.services || [],
    businessHours: {
      monday: garage.openingHours?.weekdays?.start && garage.openingHours?.weekdays?.end 
        ? `${garage.openingHours.weekdays.start}-${garage.openingHours.weekdays.end}` 
        : 'Closed',
      tuesday: garage.openingHours?.weekdays?.start && garage.openingHours?.weekdays?.end 
        ? `${garage.openingHours.weekdays.start}-${garage.openingHours.weekdays.end}` 
        : 'Closed',
      wednesday: garage.openingHours?.weekdays?.start && garage.openingHours?.weekdays?.end 
        ? `${garage.openingHours.weekdays.start}-${garage.openingHours.weekdays.end}` 
        : 'Closed',
      thursday: garage.openingHours?.weekdays?.start && garage.openingHours?.weekdays?.end 
        ? `${garage.openingHours.weekdays.start}-${garage.openingHours.weekdays.end}` 
        : 'Closed',
      friday: garage.openingHours?.weekdays?.start && garage.openingHours?.weekdays?.end 
        ? `${garage.openingHours.weekdays.start}-${garage.openingHours.weekdays.end}` 
        : 'Closed',
      saturday: garage.openingHours?.saturday?.start && garage.openingHours?.saturday?.end 
        ? `${garage.openingHours.saturday.start}-${garage.openingHours.saturday.end}` 
        : 'Closed',
      sunday: garage.openingHours?.sunday?.start && garage.openingHours?.sunday?.end 
        ? `${garage.openingHours.sunday.start}-${garage.openingHours.sunday.end}` 
        : 'Closed'
    },
    ownerId: userId,
    isActive: true,
    rating: garage.rating || 0
  };

  // Only include optional fields if they have valid values
  if (garage.price) {
    result.price = garage.price;
  }
  if (garage.paymentMethods && garage.paymentMethods.length > 0) {
    result.paymentMethods = garage.paymentMethods;
  }
  if (garage.socialMedia && Object.keys(garage.socialMedia).length > 0) {
    result.socialMedia = garage.socialMedia;
  }
  if (garage.website) {
    result.contact.website = garage.website;
  }

  // Remove any undefined values to prevent Firestore errors
  return JSON.parse(JSON.stringify(result, (key, value) => value === undefined ? null : value));
};

// Function to convert Firestore document to Garage interface
export const convertDocumentToGarage = (doc: any): Garage => {
  const data = doc.data();
  
  // Parse business hours back to openingHours format
  const parseHours = (hourString: string) => {
    if (hourString === 'Closed') return { start: '', end: '' };
    const [start, end] = hourString.split('-');
    return { start: start || '', end: end || '' };
  };

  // Convert location data to new format
  let location;
  if (data.location) {
    // Try to reconstruct address lines from the stored data
    const addressParts = (data.location.address || '').split(',').map((part: string) => part.trim());
    location = {
      addressLines: [
        addressParts[0] || '',  // Street address
        data.location.state || addressParts[1] || '',  // District/Area  
        data.location.city || addressParts[2] || '',   // City/Town
        data.location.zipCode || addressParts[addressParts.length - 1] || ''  // Postcode
      ] as [string, string, string, string],
      lat: data.location.coordinates?.lat || 0,
      long: data.location.coordinates?.lng || 0
    };
  }

  return {
    id: doc.id,
    name: data.name || '',
    address: data.location?.address || '',
    phone: data.contact?.phone || '',
    email: data.contact?.email || '',
    website: data.contact?.website || '',
    image: data.image, // Keep as optional - no default placeholder
    coverImage: data.coverImage,
    price: data.price || '£0.00',
    description: data.description || '',
    services: data.services || [],
    rating: data.rating || 0,
    location,
    openingHours: {
      weekdays: parseHours(data.businessHours?.monday || 'Closed'),
      saturday: parseHours(data.businessHours?.saturday || 'Closed'),
      sunday: parseHours(data.businessHours?.sunday || 'Closed')
    },
    paymentMethods: data.paymentMethods || [],
    socialMedia: data.socialMedia || {},
    ownerId: data.ownerId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    isActive: data.isActive !== false
  };
};

// Global submission tracking to prevent duplicates
const activeSubmissions = new Set<string>();

// Create a new garage
export const createGarage = async (garage: Partial<Garage>, userId: string, imageFile?: File, coverImageFile?: File): Promise<string> => {
  // Create a unique submission key based on user and garage name
  const submissionKey = `${userId}-${garage.name}-${Date.now()}`;
  
  // Check if a similar submission is already in progress
  if (activeSubmissions.has(submissionKey)) {
    console.log('Duplicate submission detected, skipping...');
    throw new Error('Submission already in progress');
  }
  
  // Add to active submissions
  activeSubmissions.add(submissionKey);
  
  try {
    // Clean data to remove undefined fields and image fields
    const cleanGarageData = Object.fromEntries(
      Object.entries(garage).filter(([key, value]) => {
        // Remove undefined values
        if (value === undefined) return false;
        // Remove image fields - they'll be handled separately
        if (key === 'image' || key === 'coverImage') return false;
        return true;
      })
    );

    console.log('Creating garage with clean data:', cleanGarageData);

    // Convert to Firestore document format
    const garageData = convertGarageToDocument(cleanGarageData as Partial<Garage>, userId);
    
    // Create garage document WITHOUT any image fields initially
    const garagesRef = collection(db, 'garages');
    const docRef = await addDoc(garagesRef, {
      ...garageData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
      // Explicitly DO NOT include image or coverImage fields
    });

    console.log('Garage document created with ID:', docRef.id);

    // Upload images separately and update document if uploads succeed
    const updateData: any = {};
    
    if (imageFile) {
      try {
        console.log('Uploading main image...');
        const imageUrl = await uploadGarageImage(imageFile, docRef.id, 'main');
        updateData.image = imageUrl;
        console.log('Main image uploaded:', imageUrl);
      } catch (error) {
        console.error('Error uploading main image:', error);
        // Continue without main image rather than failing the entire operation
      }
    }
    
    if (coverImageFile) {
      try {
        console.log('Uploading cover image...');
        const coverImageUrl = await uploadGarageImage(coverImageFile, docRef.id, 'cover');
        updateData.coverImage = coverImageUrl;
        console.log('Cover image uploaded:', coverImageUrl);
      } catch (error) {
        console.error('Error uploading cover image:', error);
        // Continue without cover image rather than failing the entire operation
      }
    }

    // Only update the document if we have images to add
    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = serverTimestamp();
      await updateDoc(docRef, updateData);
      console.log('Garage updated with images');
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating garage:', error);
    throw new Error('Failed to create garage');
  } finally {
    // Always remove from active submissions
    activeSubmissions.delete(submissionKey);
  }
};

// Update an existing garage
export const updateGarage = async (garageId: string, garage: Partial<Garage>, userId: string, imageFile?: File, coverImageFile?: File): Promise<void> => {
  try {
    // Clean data to remove undefined fields and image fields
    const cleanGarageData = Object.fromEntries(
      Object.entries(garage).filter(([key, value]) => {
        // Remove undefined values
        if (value === undefined) return false;
        // Remove image fields - they'll be handled separately
        if (key === 'image' || key === 'coverImage') return false;
        return true;
      })
    );

    console.log('Updating garage with clean data:', cleanGarageData);

    // Convert to Firestore document format
    const garageData = convertGarageToDocument(cleanGarageData as Partial<Garage>, userId);
    
    // Prepare update data
    const updateData: any = {
      ...garageData,
      updatedAt: serverTimestamp()
    };

    // If there are new image files, upload them
    if (imageFile) {
      try {
        // Delete old image if it exists and is not a placeholder
        if (garage.image && garage.image.startsWith('https://')) {
          await deleteGarageImage(garage.image);
        }
        
        console.log('Uploading new main image...');
        const imageUrl = await uploadGarageImage(imageFile, garageId, 'main');
        updateData.image = imageUrl;
        console.log('Main image updated:', imageUrl);
      } catch (error) {
        console.error('Error uploading main image:', error);
        // Continue without updating main image
      }
    }
    
    if (coverImageFile) {
      try {
        // Delete old cover image if it exists
        if (garage.coverImage && garage.coverImage.startsWith('https://')) {
          await deleteGarageImage(garage.coverImage);
        }
        
        console.log('Uploading new cover image...');
        const coverImageUrl = await uploadGarageImage(coverImageFile, garageId, 'cover');
        updateData.coverImage = coverImageUrl;
        console.log('Cover image updated:', coverImageUrl);
      } catch (error) {
        console.error('Error uploading cover image:', error);
        // Continue without updating cover image
      }
    }

    const garageRef = doc(db, 'garages', garageId);
    await updateDoc(garageRef, updateData);
    console.log('Garage updated successfully');
  } catch (error) {
    console.error('Error updating garage:', error);
    throw new Error('Failed to update garage');
  }
};

// Delete a garage
export const deleteGarage = async (garageId: string): Promise<void> => {
  try {
    const garageRef = doc(db, 'garages', garageId);
    await deleteDoc(garageRef);
  } catch (error) {
    console.error('Error deleting garage:', error);
    throw new Error('Failed to delete garage');
  }
};

// Get garage by ID
export const getGarageById = async (garageId: string): Promise<Garage | null> => {
  try {
    const garageRef = doc(db, 'garages', garageId);
    const garageSnap = await getDoc(garageRef);
    
    if (garageSnap.exists()) {
      return convertDocumentToGarage(garageSnap);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting garage:', error);
    throw new Error('Failed to get garage');
  }
};

// Get all garages for a specific user
export const getUserGarages = async (userId: string): Promise<Garage[]> => {
  try {
    const garagesRef = collection(db, 'garages');
    const q = query(
      garagesRef, 
      where('ownerId', '==', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const garages: Garage[] = [];
    
    querySnapshot.forEach((doc) => {
      garages.push(convertDocumentToGarage(doc));
    });
    
    return garages;
  } catch (error) {
    console.error('Error getting user garages:', error);
    throw new Error('Failed to get user garages');
  }
};

// Get all active garages (public)
export const getAllGarages = async (): Promise<Garage[]> => {
  try {
    const garagesRef = collection(db, 'garages');
    const q = query(
      garagesRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const garages: Garage[] = [];
    
    querySnapshot.forEach((doc) => {
      garages.push(convertDocumentToGarage(doc));
    });
    
    return garages;
  } catch (error) {
    console.error('Error getting all garages:', error);
    throw new Error('Failed to get garages');
  }
};

// Real-time listener for user's garages
export const subscribeToUserGarages = (
  userId: string, 
  callback: (garages: Garage[]) => void
): (() => void) => {
  const garagesRef = collection(db, 'garages');
  const q = query(
    garagesRef, 
    where('ownerId', '==', userId),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const garages: Garage[] = [];
    snapshot.forEach((doc) => {
      garages.push(convertDocumentToGarage(doc));
    });
    callback(garages);
  }, (error) => {
    console.error('Error in garage subscription:', error);
  });
};

// Soft delete garage (set isActive to false)
export const softDeleteGarage = async (garageId: string): Promise<void> => {
  try {
    const garageRef = doc(db, 'garages', garageId);
    await updateDoc(garageRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error soft deleting garage:', error);
    throw new Error('Failed to delete garage');
  }
};

// Public functions for garage listings (no authentication required)

// Get all active garages for public viewing
export const getAllPublicGarages = async (): Promise<Garage[]> => {
  try {
    const garagesRef = collection(db, 'garages');
    const q = query(
      garagesRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const garages: Garage[] = [];
    
    querySnapshot.forEach((doc) => {
      garages.push(convertDocumentToGarage(doc));
    });
    
    return garages;
  } catch (error) {
    console.error('Error getting public garages:', error);
    throw new Error('Failed to get garages');
  }
};

// Search garages by text query across multiple fields
export const searchPublicGarages = async (searchQuery: string): Promise<Garage[]> => {
  try {
    const garagesRef = collection(db, 'garages');
    const q = query(
      garagesRef,
      where('isActive', '==', true),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(q);
    const garages: Garage[] = [];
    
    querySnapshot.forEach((doc) => {
      const garage = convertDocumentToGarage(doc);
      const searchLower = searchQuery.toLowerCase();
      
      // Search across name, description, address, and services
      const matchesSearch = 
        garage.name.toLowerCase().includes(searchLower) ||
        garage.description.toLowerCase().includes(searchLower) ||
        garage.address.toLowerCase().includes(searchLower) ||
        garage.services.some(service => service.toLowerCase().includes(searchLower));
      
      if (matchesSearch) {
        garages.push(garage);
      }
    });
    
    return garages;
  } catch (error) {
    console.error('Error searching garages:', error);
    throw new Error('Failed to search garages');
  }
};

// Get garage by ID for public viewing
export const getPublicGarageById = async (garageId: string): Promise<Garage | null> => {
  try {
    const garageRef = doc(db, 'garages', garageId);
    const garageSnap = await getDoc(garageRef);
    
    if (garageSnap.exists()) {
      const garage = convertDocumentToGarage(garageSnap);
      // Only return if garage is active
      return garage.isActive ? garage : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting public garage:', error);
    throw new Error('Failed to get garage');
  }
};

// Filter garages by services
export const filterGaragesByServices = async (services: string[]): Promise<Garage[]> => {
  try {
    const garagesRef = collection(db, 'garages');
    const q = query(
      garagesRef,
      where('isActive', '==', true),
      where('services', 'array-contains-any', services),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const garages: Garage[] = [];
    
    querySnapshot.forEach((doc) => {
      garages.push(convertDocumentToGarage(doc));
    });
    
    return garages;
  } catch (error) {
    console.error('Error filtering garages by services:', error);
    throw new Error('Failed to filter garages');
  }
};

// Filter garages by location (city, state, or address)
export const filterGaragesByLocation = async (location: string): Promise<Garage[]> => {
  try {
    const garagesRef = collection(db, 'garages');
    const q = query(
      garagesRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const garages: Garage[] = [];
    const locationLower = location.toLowerCase();
    
    querySnapshot.forEach((doc) => {
      const garage = convertDocumentToGarage(doc);
      
      // Check if location matches address
      if (garage.address.toLowerCase().includes(locationLower)) {
        garages.push(garage);
      }
    });
    
    return garages;
  } catch (error) {
    console.error('Error filtering garages by location:', error);
    throw new Error('Failed to filter garages');
  }
};
