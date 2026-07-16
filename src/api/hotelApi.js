import instance from "./axios";

export const getHotels = () => instance.get("/api/hotels/");
