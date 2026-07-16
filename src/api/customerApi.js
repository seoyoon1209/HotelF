import instance from "./axios";

export const getCustomers = () => instance.get("/api/customers/");
