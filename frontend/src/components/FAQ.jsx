export default function FAQ() {
  return (
    <div className="container" style={{ padding: 20 }}>
      <h1>FAQ</h1>

      <div style={{ marginTop: 16, display: 'grid', gap: 14, lineHeight: 1.7 }}>
        <div>
          <h3 style={{ marginBottom: 6 }}>1) What fabrics do you offer?</h3>
          <div style={{ opacity: 0.9 }}>
            We offer a curated range of traditional silk, soft cotton, and blended fabrics suitable for daily wear,
            festive occasions, and bridal collections.
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: 6 }}>2) How do I choose the right saree for an occasion?</h3>
          <div style={{ opacity: 0.9 }}>
            Cotton sarees are ideal for daily wear and summer comfort, while silk sarees are best for weddings and festive
            functions. For bridal wear, we recommend heavier silk with rich borders and traditional motifs.
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: 6 }}>3) Do you provide Cash on Delivery (COD)?</h3>
          <div style={{ opacity: 0.9 }}>
            COD availability depends on your project setup and location rules. If COD is enabled in checkout, you can select
            it while placing your order.
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: 6 }}>4) How long will delivery take?</h3>
          <div style={{ opacity: 0.9 }}>
            Delivery timelines vary by location. Typically, orders are delivered within 3–7 working days after confirmation.
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: 6 }}>5) What is your return/refund policy?</h3>
          <div style={{ opacity: 0.9 }}>
            Please refer to our Return Policy page for full details. In general, returns are accepted within the allowed time
            window if the product is unused and in original condition.
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: 6 }}>6) How can I contact support?</h3>
          <div style={{ opacity: 0.9 }}>
            You can reach us via the Contact Us page (email/phone). Share your Order ID for faster help.
          </div>
        </div>
      </div>
    </div>
  );
}
