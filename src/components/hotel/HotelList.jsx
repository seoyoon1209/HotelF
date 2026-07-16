// 호텔 목록 페이지. ReservationList.jsx와 동일한 패턴으로 axios 연동.
import { useEffect, useState } from "react";
import { getHotels } from "src/api/hotelApi";

function HotelList() {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    getHotels().then((res) => setHotels(res.data));
  }, []);

  return (
    <div>
      <h1>호텔 목록</h1>
      <ul>
        {hotels.map((hotel) => (
          <li key={hotel.hotel_id}>
            {hotel.hotel_name} ({hotel.city})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HotelList;
