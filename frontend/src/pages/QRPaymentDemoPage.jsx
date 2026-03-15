import React from 'react';
import QRPaymentDemo from '../components/QRPaymentDemo';

const QRPaymentDemoPage = () => {
  return (
    <div className="qr-payment-demo-page">
      <QRPaymentDemo totalAmount={100} />
    </div>
  );
};

export default QRPaymentDemoPage;
