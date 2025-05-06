import { buildCollection, buildProperty } from "@firecms/core";
import { User } from "firebase/auth";

// Helper function to check if a user is an admin or dealer
const isAdminOrDealer = (user: User | null) => {
  if (!user?.email) return false;
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(email => email.trim());
  return adminEmails.includes(user.email);
};

// Vehicles collection configuration
export const vehiclesCollection = buildCollection({
  name: "Vehicles",
  singularName: "Vehicle",
  path: "vehicles",
  properties: {
    title: buildProperty({
      name: "Title",
      dataType: "string",
      validation: { required: true }
    }),
    category: buildProperty({
      name: "Category",
      dataType: "string",
      enumValues: {
        car: "Car",
        van: "Van",
        garage: "Garage",
        breakdown: "Breakdown Service"
      },
      validation: { required: true }
    }),
    make: buildProperty({
      name: "Make",
      dataType: "string",
      validation: { required: true }
    }),
    model: buildProperty({
      name: "Model",
      dataType: "string",
      validation: { required: true }
    }),
    year: buildProperty({
      name: "Year",
      dataType: "number",
      validation: { required: true }
    }),
    price: buildProperty({
      name: "Price",
      dataType: "number",
      validation: { required: true }
    }),
    fuelType: buildProperty({
      name: "Fuel Type",
      dataType: "string",
      validation: { required: true }
    }),
    engineSize: buildProperty({
      name: "Engine Size",
      dataType: "number",
      validation: { required: true }
    }),
    color: buildProperty({
      name: "Color",
      dataType: "string",
      validation: { required: true }
    }),
    description: buildProperty({
      name: "Description",
      dataType: "string",
      validation: { required: true }
    }),
    co2Emission: buildProperty({
      name: "CO2 Emission",
      dataType: "string",
      validation: { required: true }
    }),
    call: buildProperty({
      name: "Contact Number",
      dataType: "string",
      validation: { required: true }
    }),
    mileage: buildProperty({
      name: "Mileage",
      dataType: "number",
      validation: { required: true }
    }),
    transmission: buildProperty({
      name: "Transmission",
      dataType: "string",
      validation: { required: true }
    }),
    registrationMonth: buildProperty({
      name: "Registration Month",
      dataType: "string",
      validation: { required: true }
    }),
    registrationNumber: buildProperty({
      name: "Registration Number",
      dataType: "string",
      validation: { required: true }
    }),
    createdAt: buildProperty({
      name: "Created At",
      dataType: "timestamp",
      autoValue: "on_create"
    }),
    createdBy: buildProperty({
      name: "Created By",
      dataType: "string",
      validation: { required: true }
    })
  },
  permissions: {
    read: true,
    create: (user: User | null) => isAdminOrDealer(user),
    update: (user: User | null) => isAdminOrDealer(user),
    delete: (user: User | null) => isAdminOrDealer(user)
  }
}); 