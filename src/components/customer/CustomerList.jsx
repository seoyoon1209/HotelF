// 고객 목록 페이지. ReservationList.jsx와 동일한 패턴으로 axios 연동.
import { useEffect, useState } from "react";
import { getCustomers } from "src/api/customerApi";

function CustomerList() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    getCustomers().then((res) => setCustomers(res.data));
  }, []);

  return (
    <div>
      <h1>고객 목록</h1>
      <ul>
        {customers.map((customer) => (
          <li key={customer.customer_id}>
            {customer.customer_name} ({customer.email})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CustomerList;
