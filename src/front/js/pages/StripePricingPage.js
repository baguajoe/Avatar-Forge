// StripePricingPage.js
import React, { useEffect, useState } from 'react';

const plans = [
  { name: 'Basic', price: 9.99, limit: 5 },
  { name: 'Pro', price: 19.99, limit: 20 },
  { name: 'Premium', price: 29.99, limit: Infinity },
];

const StripePricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSubscribe = async (plan) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const { checkout_url } = await res.json();
      window.location.href = checkout_url;
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  return (
    <div>
      <h2>Choose a Plan</h2>
      <div className="plan-grid">
        {plans.map((plan) => (
          <div key={plan.name} className="plan-card">
            <h3>{plan.name}</h3>
            <p>${plan.price} / month</p>
            <p>Rigging Limit: {plan.limit === Infinity ? 'Unlimited' : plan.limit}</p>
            <button onClick={() => handleSubscribe(plan.name)}>Subscribe</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StripePricingPage;


  

