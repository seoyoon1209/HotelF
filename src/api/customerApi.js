// customer API 호출 모음
import instance from "./axios";

export const getCustomers = () => instance.get("/api/customers/");
