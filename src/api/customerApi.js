// customer API 호출 모음. 백엔드 router/CustomerRouter.py와 1:1 대응.
import instance from "./axios";

export const getCustomers = () => instance.get("/api/customers/");
